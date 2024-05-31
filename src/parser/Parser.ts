import { error } from "./Reporter";
import { Token } from "./Token";
import { TokenType } from "./TokenType";

import { Expr } from "./Expr";
import { Stmt } from "./Stmt";

export class Parser {
  private current = 0;

  constructor(private tokens: Token[]) {}

  parse() {
    const statements: Stmt[] = [];

    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }

    return statements;
  }

  private declaration() {
    try {
      if (this.match(TokenType.Var)) {
        return this.varDeclaration();
      }

      return this.statement();
    } catch (error) {
      this.synchronize();
      return null;
    }
  }

  private varDeclaration() {
    const name = this.consume(TokenType.Identifier, "Expect variable name.");

    let initializer: Expr = null;
    if (this.match(TokenType.Equal)) {
      initializer = this.expression();
    }

    this.consume(TokenType.Semicolon, "Expect ';' after variable declaration.");
    return Stmt.Var(name, initializer);
  }

  private statement() {
    if (this.match(TokenType.Print)) return this.printStatement();

    return this.expressionStatement();
  }

  private printStatement() {
    const expression = this.expression();
    this.consume(TokenType.Semicolon, "Expect ';' after value.");
    return Stmt.Print(expression);
  }

  private expressionStatement() {
    const expression = this.expression();
    this.consume(TokenType.Semicolon, "Expect ';' after expression.");
    return Stmt.Expression(expression);
  }

  private expression() {
    return this.assignment();
  }

  private assignment() {
    const expression = this.equality();

    if (this.match(TokenType.Equal)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expression.type === Expr.Type.Variable) {
        const name = expression.name;
        return Expr.Assignment(name, value);
      }

      error(equals, "Invalid assignment target.");
    }

    return expression;
  }

  private equality() {
    let expr = this.comparison();

    while (this.match(TokenType.BangEqual, TokenType.EqualEqual)) {
      let operator = this.previous();
      let right = this.comparison();
      expr = Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison() {
    let expr = this.term();

    while (
      this.match(
        TokenType.Greater,
        TokenType.GreaterEqual,
        TokenType.Less,
        TokenType.LessEqual
      )
    ) {
      let operator = this.previous();
      let right = this.term();
      expr = Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private term() {
    let expr = this.factor();

    while (this.match(TokenType.Minus, TokenType.Plus)) {
      let operator = this.previous();
      let right = this.factor();
      expr = Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private factor() {
    let expr = this.unary();

    while (this.match(TokenType.Slash, TokenType.Star)) {
      let operator = this.previous();
      let right = this.unary();
      expr = Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.Bang, TokenType.Minus)) {
      let operator = this.previous();
      let right = this.unary();
      return Expr.Unary(operator, right);
    }

    return this.primary();
  }

  private primary() {
    if (this.match(TokenType.False)) return Expr.Literal(false);
    if (this.match(TokenType.True)) return Expr.Literal(true);
    if (this.match(TokenType.Nil)) return Expr.Literal(null);

    if (this.match(TokenType.Number, TokenType.String)) {
      return Expr.Literal(this.previous().literal);
    }

    if (this.match(TokenType.Identifier)) {
      return Expr.Variable(this.previous());
    }

    if (this.match(TokenType.LeftParen)) {
      let expr = this.expression();
      this.consume(TokenType.RightParen, "Expect ')' after expression.");
      return Expr.Grouping(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  private match(...types: TokenType[]) {
    for (let type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private consume(type: TokenType, message: string) {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  private check(type: TokenType) {
    if (this.isAtEnd()) return false;
    return this.peek().type == type;
  }

  private advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd() {
    return this.peek().type == TokenType.EOF;
  }

  private peek() {
    return this.tokens[this.current];
  }

  private previous() {
    return this.tokens[this.current - 1];
  }

  private error(token: Token, message: string) {
    error(token, message);
    return new ParseError();
  }

  private synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type == TokenType.Semicolon) return;

      switch (this.peek().type) {
        case TokenType.Class:
        case TokenType.Fun:
        case TokenType.Var:
        case TokenType.For:
        case TokenType.If:
        case TokenType.While:
        case TokenType.Print:
        case TokenType.Return:
          return;
      }

      this.advance();
    }
  }
}

class ParseError extends Error {}
