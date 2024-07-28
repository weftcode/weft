import { BaseParser } from "./BaseParser";

import { Token } from "./Token";
import { TokenType } from "./TokenType";

import { Expr } from "./Expr";
import { Stmt } from "./Stmt";
import { ErrorReporter } from "./Reporter";

// Tuple of precedence and associativity
export type Precedence = [number, "left" | "right"];
export type Operators = Map<TokenType, Precedence>;

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
            // TODO: Synchronization
            throw this.reporter.error(error.token, error.message);
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
      this.consume(TokenType.LineBreak, "Expect new line after expression.");
    }

    return Stmt.Expression(expression);
  }

  private expression(precedence: number) {
    let left = this.application();

    while (this.operators.has(this.peek().type)) {
      let [opPrecedence, opAssociativity] = this.operators.get(
        this.peek().type
      );

      // If we encounter a lower-precedence operator, stop consuming tokens
      if (opPrecedence < precedence) break;

      // Check for a paren after operator, which may indicate a section
      if (this.peekNext().type === TokenType.RightParen) break;

      // Consume operator
      let operator = this.advance();
      let right = this.expression(
        opAssociativity === "left" ? opPrecedence + 1 : opPrecedence
      );

      // Associate operator
      left = Expr.Binary(left, operator, right, opPrecedence);
    }

    return left;
  }

  private application() {
    let expr = this.grouping();

    while (this.peekFunctionTerm()) {
      let right = this.grouping();
      expr = Expr.Application(expr, right);
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

  private grouping() {
    if (this.match(TokenType.LeftParen)) {
      let leftOp: Token | null = null;
      let rightOp: Token | null = null;

      // Check for an initial operator
      if (this.operators.has(this.peek().type)) {
        leftOp = this.advance();
      }

      let expr = this.expression(0);

      // Check for a trailing operator
      if (this.operators.has(this.peek().type)) {
        rightOp = this.advance();
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

        let [precedence] = this.operators.get(operator.type);
        if (expr.type === Expr.Type.Binary && expr.precedence < precedence) {
          throw new ParseError(
            operator,
            "Section operator must have lower precedence than expression"
          );
        }

        expr = Expr.Section(operator, expr, side);
      }

      return Expr.Grouping(expr);
    } else {
      return this.functionTerm();
    }
  }

  private functionTerm() {
    if (this.match(TokenType.Number, TokenType.String)) {
      return Expr.Literal(this.previous().literal);
    }

    if (this.match(TokenType.Identifier)) {
      return Expr.Variable(this.previous());
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

      return Expr.List(items);
    }

    throw new EmptyExpressionError(this.peek());
  }
}

import { ParseError } from "./BaseParser";

class EmptyExpressionError extends ParseError {
  constructor(token: Token) {
    super(token, "Expected expression.");
  }
}
