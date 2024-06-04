import { TokenType } from "./TokenType";

export type LoxType = null | boolean | number | string;

export class Token {
  constructor(
    readonly type: TokenType,
    readonly lexeme: string,
    readonly literal: LoxType,
    readonly line: number
  ) {}

  toString() {
    return `${this.type} ${this.lexeme.replace("\n", "\\n")} ${this.literal}`;
  }
}
