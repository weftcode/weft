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
        statements.push(this.expressionStatement());
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

      // Consume operator
      let operator = this.advance();
      let right = this.expression(
        opAssociativity === "left" ? opPrecedence + 1 : opPrecedence
      );

      // Associate operator
      left = Expr.Binary(left, operator, right);
    }

    return left;
  }

  private application() {
    let expr = this.functionTerm();

    while (this.peekFunctionTerm()) {
      let right = this.functionTerm();
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

  private functionTerm() {
    if (this.match(TokenType.Number, TokenType.String)) {
      return Expr.Literal(this.previous().literal);
    }

    if (this.match(TokenType.Identifier)) {
      return Expr.Variable(this.previous());
    }

    if (this.match(TokenType.LeftParen)) {
      let expr = this.expression(0);
      this.consume(TokenType.RightParen, "Expect ')' after expression.");
      return Expr.Grouping(expr);
    }

    if (this.match(TokenType.LeftBracket)) {
      let items: Expr[] = [];

      while (!this.match(TokenType.RightBracket)) {
        if (this.isAtEnd()) {
          throw this.reporter.error(this.peek(), "Unterminated list literal");
        }

        if (items.length > 0) {
          this.consume(TokenType.Comma, "Expect ',' after list items");
        }

        items.push(this.expression(0));
      }

      return Expr.List(items);
    }

    throw this.reporter.error(this.peek(), "Expect expression.");
  }
}
