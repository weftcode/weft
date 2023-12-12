import { Token, TokenType } from "./Scanner.ts";

export interface TokenStream {
  next(): Token;
  peek(num?: number): Token;
  match(...types: TokenType[]): Token | null;
}

export function parse(tokens: Token[]): TokenStream {
  let current = 0;

  const done = () => tokens[current].type === TokenType.EOF;

  const peek = () => {
    if (done()) return tokens[current];
    return tokens[current];
  }

  return {
    next() {
      if (done()) return tokens[current];
      return tokens[current++];
    },
    peek() {
      return tokens[current];
    },
    match(...types) {
      for (let type of types) {
        if (tokens[current].type = )
      }

      return null;
    }
  };
}
