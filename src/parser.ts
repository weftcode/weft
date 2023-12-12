import { Token, TokenType } from "./Scanner.ts";
import { TokenStream } from "./TokenStream.ts";

function binaryExpression(stream: TokenStream) {
  const { match } = stream;
  let left = term(stream);

  let operator: Token;

  while (operator) {}
}

function term(stream: TokenStream) {}
