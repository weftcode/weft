import { ExternalTokenizer } from "@lezer/lr";

import { Comment, VarSym, ConSym } from "./weft.grammar.terms";

const symbols = new Set(
  Array.from("!#$%&⋆+./<=>?@\\^|-~:").map((c) => c.charCodeAt(0)),
);

const Newline = 10;
const Dash = 45;
const Colon = 58;

export const tokenizeSymbol = new ExternalTokenizer((input) => {
  let { next } = input;

  if (!symbols.has(next)) {
    // If the next character is not a symbol character, then bail
    return;
  }

  // Symbols beginning with a colon are ConSym
  const isConstructor = next === Colon;

  // A symbol beginning with two dashes may be a comment unless
  // it includes a different symbol character
  let isDashes = next === Dash && input.peek(1) === Dash;

  // Now consume symbol characters
  while (symbols.has(next)) {
    // Keep checking that all symbol characters are dashes
    isDashes = isDashes && next === Dash;

    next = input.advance();
  }

  // If the symbol is not a "dashes" symbol (ie. 2+ hyphens with
  // no other symbol characters), then accept a symbol
  if (!isDashes) {
    input.acceptToken(isConstructor ? ConSym : VarSym);
    return;
  }

  // Otherwise, consume a comment
  while (next !== -1 && next !== Newline) {
    next = input.advance();
  }

  // At this point, consume a comment
  input.acceptToken(Comment, next === Newline ? 1 : 0);
});
