import { error } from "./Reporter";
import { Token } from "./Token";
import { TokenType } from "./TokenType";

export abstract class BaseParser<T> {
  private current = 0;

  constructor(private tokens: Token[]) {}

  abstract parse(): T;

  protected match(...types: TokenType[]) {
    for (let type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  protected consume(type: TokenType, message: string) {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  protected check(type: TokenType) {
    if (this.isAtEnd()) return false;
    return this.peek().type == type;
  }

  private advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  protected isAtEnd() {
    return this.peek().type == TokenType.EOF;
  }

  protected peek() {
    return this.tokens[this.current];
  }

  protected previous() {
    return this.tokens[this.current - 1];
  }

  protected error(token: Token, message: string) {
    error(token, message);
    return new ParseError();
  }

  protected synchronize() {
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
