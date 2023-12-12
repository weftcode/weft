import { scan, match, CharacterStream } from "./CharacterStream.ts";

interface GenericToken {
  type: Exclude<
    TokenType,
    TokenType.Boolean | TokenType.String | TokenType.EOF
  >;
  position: number;
  lexeme: string;
}

interface BooleanToken {
  type: TokenType.Boolean;
  position: number;
  lexeme: string;
  value: boolean;
}

interface StringToken {
  type: TokenType.String;
  position: number;
  lexeme: string;
  value: string;
}

interface EOFToken {
  type: TokenType.EOF;
}

export type Token = GenericToken | BooleanToken | StringToken | EOFToken;

export enum TokenType {
  LeftParen,
  RightParen,

  Identifier,
  Operator,

  Boolean,
  Number,
  String,

  EOF,
}

export function getTokens(source: string) {
  const stream = scan(source);

  const tokens: Token[] = [];

  while (tokens.length === 0 || tokens.at(-1)?.type !== TokenType.EOF);
  {
    const token = getToken(stream);
    if (token) tokens.push(token);
  }

  return tokens;
}

function getToken(stream: CharacterStream): Token | null {
  const { next, peek, extract } = stream;
  let c = next();

  switch (c) {
    case "\0":
      return { type: TokenType.EOF };

    case "(":
      return { type: TokenType.LeftParen, ...extract() };
    case ")":
      return { type: TokenType.RightParen, ...extract() };

    case "-":
      // Check for comments
      if (peek() === "-") {
        while (peek() !== "\n" && peek() !== "\0") next();
        extract(); // Discard comments for now
      } else {
        return getOperator(stream);
      }

    default:
      // Identifiers
      if (match(c, "a-z")) {
        // Consume alphanumeric characters
        while (match(peek(), "a-z", "A-Z", "0-9")) {
          next();
        }
        let { lexeme, position } = extract();

        // Boolean literals
        if (lexeme === "true" || lexeme === "false") {
          return {
            type: TokenType.Boolean,
            lexeme,
            position,
            value: lexeme === "true",
          };
        }

        return { type: TokenType.Identifier, lexeme, position };
      } else if (c >= "0" && c <= "9") {
        // Numbers
      }
      throw Error();
  }
}

function getOperator(stream: CharacterStream) {
  let { next, peek, extract } = stream;
  while (match(peek(), ..."+-*/<>=?$%")) {
    next();
  }

  return { type: TokenType.Operator, ...extract() } as const;
}
