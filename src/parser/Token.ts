import { TokenType } from "./TokenType";

export type Primitive = boolean | number | string;

export class Token {
  constructor(
    readonly type: TokenType,
    readonly lexeme: string,
    readonly literal: Primitive,
    readonly line: number
  ) {}

  toString() {
    return `${this.type} ${this.lexeme.replace("\n", "\\n")} ${this.literal}`;
  }
}
