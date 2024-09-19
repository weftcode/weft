import { Bindings } from "../compiler/parse/API";
import { TokenType } from "../compiler/scan/TokenType";

import { reify } from "@strudel/core";

export const operators: Bindings = {
  // Haskell Operators
  $: {
    // Function application
    type: "(a -> b) -> a -> b",
    value: (a, b) => a(b),
    token: TokenType.Dollar,
    prec: [0, "right"],
  },
  ".": {
    // Function composition
    type: "(b -> c) -> (a -> b) -> a -> c",
    value: (a, b) => (c) => a(b(c)),
    token: TokenType.Dot,
    prec: [9, "right"],
  },
  ":": {
    // Cons operator
    // TODO: this isn't actually parseable yet, it's only used for
    // typechecking list literals
    type: "a -> [a] -> [a]",
    value: (a, as) => [a, ...as],
    token: TokenType.Colon,
    prec: [5, "right"],
  },
  "[]": {
    // Empty list constructor
    type: "[a]",
    value: [],
  },

  // Addition/subtration (and pattern variants)
  "+": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).add.mix(reify(b)),
    token: TokenType.Plus,
    prec: [6, "left"],
  },
  "|+": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).add.in(reify(b)),
    token: TokenType.PlusSL,
    prec: [6, "left"],
  },
  "|+|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).add.mix(reify(b)),
    token: TokenType.PlusSB,
    prec: [6, "left"],
  },
  "+|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).add.out(reify(b)),
    token: TokenType.PlusSR,
    prec: [6, "left"],
  },
  "-": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).sub.mix(reify(b)),
    token: TokenType.Minus,
    prec: [6, "left"],
  },
  "|-": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).sub.in(reify(b)),
    token: TokenType.MinusSL,
    prec: [6, "left"],
  },
  "|-|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).sub.mix(reify(b)),
    token: TokenType.MinusSB,
    prec: [6, "left"],
  },
  "-|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).sub.out(reify(b)),
    token: TokenType.MinusSR,
    prec: [6, "left"],
  },

  // Multiplication/division (and pattern variants)
  "*": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).mul.mix(reify(b)),
    token: TokenType.Star,
    prec: [7, "left"],
  },
  "|*": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).mul.in(reify(b)),
    token: TokenType.StarSL,
    prec: [7, "left"],
  },
  "|*|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).mul.mix(reify(b)),
    token: TokenType.StarSB,
    prec: [7, "left"],
  },
  "*|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).mul.out(reify(b)),
    token: TokenType.StarSR,
    prec: [7, "left"],
  },
  "/": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).div.mix(reify(b)),
    token: TokenType.Slash,
    prec: [7, "left"],
  },
  "|/": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).div.in(reify(b)),
    token: TokenType.SlashSL,
    prec: [7, "left"],
  },
  "|/|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).div.mix(reify(b)),
    token: TokenType.SlashSB,
    prec: [7, "left"],
  },
  "/|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).div.out(reify(b)),
    token: TokenType.SlashSR,
    prec: [7, "left"],
  },

  // Apply pattern values
  "|<": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(b).set.out(reify(a)),
    token: TokenType.LeftSL,
    prec: [8, "left"],
  },
  "|<|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(b).set.mix(reify(a)),
    token: TokenType.LeftSB,
    prec: [8, "left"],
  },
  "<|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(b).set.in(reify(a)),
    token: TokenType.LeftSR,
    prec: [8, "left"],
  },
  "|>": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).set.in(reify(b)),
    token: TokenType.RightSL,
    prec: [8, "left"],
    synonyms: ["#"],
  },
  "|>|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).set.mix(reify(b)),
    token: TokenType.RightSB,
    prec: [8, "left"],
  },
  ">|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).set.out(reify(b)),
    token: TokenType.RightSR,
    prec: [8, "left"],
  },
};
