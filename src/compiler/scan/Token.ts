import { TokenType } from "./TokenType";

export type Token = Token.Source | Token.Error;

export namespace Token {
  export interface Source {
    type: Exclude<TokenType, TokenType.Error>;
    lexeme: string;
    from: number;
  }

  export interface Error {
    type: TokenType.Error;
    lexeme: string;
    from: number;
    message: string;
  }
}

export function tokenBounds(token: Token) {
  let { from } = token;
  let lexeme = "lexeme" in token ? token.lexeme : "";

  return {
    from,
    to: from + lexeme.length,
  };
}
