import { BaseParser } from "./BaseParser";

import { Token, tokenBounds } from "../scan/Token";
import { TokenType } from "../scan/TokenType";

import { Expr } from "./AST/Expr";
import { Stmt } from "./AST/Stmt";

import { TypeEnv } from "../environment";

export class Parser extends BaseParser<Stmt[]> {
  constructor(tokens: Token[], private environment: TypeEnv) {
    super(tokens);
  }

  parse() {
    const statements: Stmt[] = [];

    while (!this.isAtEnd()) {
      if (this.check(TokenType.LineBreak)) {
        // Ignore empty lines
        this.advance();
      } else {
        try {
          statements.push(this.expressionStatement());
        } catch (error) {
          if (error instanceof ParseError) {
            let { token, message } = error;
            let { from, to } = tokenBounds(token);
            statements.push({ is: Stmt.Is.Error, message, from, to });
          } else {
            throw error;
          }
        }
      }
    }

    return statements;
  }

  private expressionStatement(): Stmt {
    const expression = this.expression(0);

    if (!this.isAtEnd()) {
      // This surely means we've encountered an error
      if (expression.is === Expr.Is.Empty) {
        let next = this.advance();
        throw new ParseError(next, `Unexpected token "${next.lexeme}"`);
      }

      this.consume(TokenType.LineBreak, "Expect new line after expression.");
    }

    return { is: Stmt.Is.Expression, expression };
  }

  private expression(precedence: number): Expr {
    let left = this.application();

    while (this.peek().type === TokenType.Operator) {
      let op = this.environment[this.peek().lexeme];
      if (!op) {
        throw new ParseError(
          this.peek(),
          `Undefined operator "${this.peek().lexeme}"`
        );
      }
      let [opPrecedence, opAssociativity] = op.prec ?? [9, "left"];

      // If we encounter a lower-precedence operator, stop consuming tokens
      if (opPrecedence < precedence) break;

      // Check for a paren after operator, which may indicate a section
      if (this.peekNext().type === TokenType.RightParen) break;

      // Consume operator
      let operator = { is: Expr.Is.Variable, name: this.advance() } as const;
      let right = this.expression(
        opAssociativity === "left" ? opPrecedence + 1 : opPrecedence
      );

      // Check for empty expressions
      let lNull = left.is === Expr.Is.Empty;
      let rNull = right.is === Expr.Is.Empty;
      if (lNull || rNull) {
        throw new ParseError(
          operator.name,
          `Missing expression ${lNull ? "before" : ""}${
            lNull && rNull ? " and " : ""
          }${rNull ? "after" : ""} the "${operator.name.lexeme}" operator`
        );
      }

      // Associate operator
      left = { is: Expr.Is.Binary, left, operator, right, precedence };
    }

    return left;
  }

  private application(): Expr {
    let expr = this.grouping();

    while (this.peekFunctionTerm()) {
      let right = this.grouping();
      expr = { is: Expr.Is.Application, left: expr, right };
    }

    return expr;
  }

  private peekFunctionTerm() {
    const nextType = this.peek().type;

    return (
      nextType === TokenType.Identifier ||
      nextType === TokenType.LeftParen ||
      nextType === TokenType.LeftBracket ||
      nextType === TokenType.Number ||
      nextType === TokenType.String
    );
  }

  private grouping(): Expr {
    if (this.match(TokenType.LeftParen)) {
      let leftParen = this.previous();
      let leftOp: Expr.Variable | null = null;
      let rightOp: Expr.Variable | null = null;

      // Check for an initial operator
      if (this.peek().type === TokenType.Operator) {
        leftOp = { is: Expr.Is.Variable, name: this.advance() };
      }

      // This is kind of a hacky way to attempt this
      if (this.match(TokenType.RightParen)) {
        if (leftOp) {
          return leftOp;
        } else {
          throw "Encountered unit literal, but unit isn't supported yet";
        }
      }

      let expression = this.expression(0);

      // Check for a trailing operator
      if (this.peek().type === TokenType.Operator) {
        rightOp = { is: Expr.Is.Variable, name: this.advance() };
      }

      let rightParen = this.consume(
        TokenType.RightParen,
        "Expect ')' after expression."
      );

      let sectionOp: Pick<Expr.Section, "operator" | "side"> | null = null;

      if (leftOp) {
        // Operator on both sides of a parenthesized expression: (+ 1 +)
        if (rightOp) {
          throw new ParseError(rightParen, "Expect expression.");
        }

        sectionOp = { operator: leftOp, side: "left" };
      } else if (rightOp) {
        sectionOp = { operator: rightOp, side: "right" };
      }

      if (sectionOp) {
        let { operator, side } = sectionOp;
        let op = this.environment[operator.name.lexeme];

        if (!op) {
          throw new ParseError(
            this.peek(),
            `Undefined operator "${this.peek().lexeme}"`
          );
        }
        let [precedence] = op.prec ?? [9];

        if (
          expression.is === Expr.Is.Binary &&
          expression.precedence < precedence
        ) {
          throw new ParseError(
            operator.name,
            "Section operator must have lower precedence than expression"
          );
        }

        expression = { is: Expr.Is.Section, operator, expression, side };
      }

      return { is: Expr.Is.Grouping, expression, leftParen, rightParen };
    } else {
      return this.functionTerm();
    }
  }

  private functionTerm(): Expr {
    if (this.match(TokenType.Number, TokenType.String)) {
      let token = this.previous();

      const checkLiteralToken = (
        t: Token
      ): t is Token & { type: TokenType.Number | TokenType.String } =>
        t.type === TokenType.Number || t.type === TokenType.String;

      // This is only necessary because `this.match` doesn't provide enough guarantees
      // to TS that the token is of the requested type
      if (checkLiteralToken(token)) {
        return {
          is: Expr.Is.Literal,
          token,
        };
      } else {
        throw new Error(`Matched with incorrect literal token: ${token.type}`);
      }
    }

    if (this.match(TokenType.Identifier)) {
      return { is: Expr.Is.Variable, name: this.previous() };
    }

    if (this.match(TokenType.LeftBracket)) {
      let leftBracket = this.previous();
      let items: Expr[] = [];

      while (!this.match(TokenType.RightBracket)) {
        if (this.isAtEnd()) {
          throw new ParseError(this.peek(), "Unterminated list literal");
        }

        if (items.length > 0) {
          this.consume(TokenType.Comma, "Expect ',' after list items");
        }

        items.push(this.expression(0));
      }

      let rightBracket = this.previous();

      return { is: Expr.Is.List, items, leftBracket, rightBracket };
    }

    return { is: Expr.Is.Empty };
  }
}

import { ParseError } from "./BaseParser";
