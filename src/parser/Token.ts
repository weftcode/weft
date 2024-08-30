import { TokenType } from "./TokenType";

export type Primitive = boolean | number | string;

export class Token {
  constructor(
    readonly type: TokenType,
    readonly lexeme: string,
    readonly literal: Primitive,
    readonly from: number
  ) {}

  get to() {
    return this.from + this.lexeme.length;
  }

  toString() {
    return `${this.type} ${this.lexeme.replace("\n", "\\n")} ${this.literal}`;
  }
}

export class ErrorToken extends Token {
  constructor(lexeme: string, from: number, readonly message: string) {
    super(TokenType.Error, lexeme, null, from);
  }
}
