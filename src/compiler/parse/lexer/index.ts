import { createToken, Lexer } from "chevrotain";

// Literals

export const Decimal = createToken({ name: "Decimal", pattern: /\d+\.\d+/ });

export const Integer = createToken({ name: "Integer", pattern: /\d+/ });

// Identifiers

export const ConId = createToken({
  name: "ConId",
  pattern: /[A-Z]\w*/,
});

export const VarId = createToken({ name: "VarID", pattern: /[a-z]\w*/ });

export const ConSym = createToken({
  name: "ConSym",
  pattern: /:[!#$%&*+./<=>?@\\^|\-~:]+/,
});

// This definition overlaps with ConSym for the sake of simplicity,
// so we specify that ConSym takes precedence
export const VarSym = createToken({
  name: "VarSym",
  pattern: /[!#$%&*+./<=>?@\\^|\-~:]+/,
});

// Special Symbols

export const Equal = createToken({
  name: "=",
  pattern: /=/,
  longer_alt: VarSym,
});

// Keywords

export const Let = createToken({
  name: "let",
  pattern: /let/,
  longer_alt: VarId,
});

export const Fn = createToken({ name: "fn", pattern: /fn/, longer_alt: VarId });

export const tokens = [
  // Literals
  Decimal,
  Integer,
  // Keywords
  Let,
  Fn,
  // Identifiers
  ConId,
  VarId,
  ConSym,
  VarSym,
];

export const WeftLexer = new Lexer(tokens);
