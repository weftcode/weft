import { BaseParser } from "./BaseParser";

import { Operators } from "./API";

import { Token, tokenBounds } from "../scan/Token";
import { TokenType } from "../scan/TokenType";

import { Expr } from "./Expr";
import { Stmt } from "./Stmt";
import { ErrorReporter } from "./Reporter";

export class Parser extends BaseParser<Stmt[]> {
  constructor(
    tokens: Token[],
    private operators: Operators,
    reporter: ErrorReporter
  ) {
    super(tokens, reporter);
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
            let { from, to } = tokenBounds(error.token);
            this.reporter.error(from, to, error.message);
            this.synchronize();
            break;
          } else {
            throw error;
          }
        }
      }
    }

    return statements;
  }

  private expressionStatement() {
    const expression = this.expression(0);

    if (!this.isAtEnd()) {
      // This surely means we've encountered an error
      if (expression.is === Expr.Is.Empty) {
        let next = this.advance();
        throw new ParseError(next, `Unexpected token "${next.lexeme}"`);
      }

      this.consume(TokenType.LineBreak, "Expect new line after expression.");
    }

    return Stmt.Expression(expression);
  }

  private expression(precedence: number) {
    let left = this.application();

    while (this.peek().type === TokenType.Operator) {
      let op = this.operators.get(this.peek().lexeme);
      if (!op) {
        throw new ParseError(
          this.peek(),
          `Undefined operator "${this.peek().lexeme}"`
        );
      }
      let [opPrecedence, opAssociativity] = op;

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

  private application() {
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

      if (leftOp || rightOp) {
        if (leftOp && rightOp) {
          throw new ParseError(rightParen, "Expect expression.");
        }

        let operator = leftOp ?? rightOp;
        let side: "left" | "right" = leftOp ? "left" : "right";

        let op = this.operators.get(operator.name.lexeme);
        if (!op) {
          throw new ParseError(
            this.peek(),
            `Undefined operator "${this.peek().lexeme}"`
          );
        }
        let [precedence] = op;

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

      return { is: Expr.Is.Grouping, leftParen, expression, rightParen };
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
        token.type === TokenType.Number || token.type === TokenType.String;

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

      return { is: Expr.Is.List, items };
    }

    return { is: Expr.Is.Empty };
  }
}

import { ParseError } from "./BaseParser";
