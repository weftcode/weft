import { Bindings } from "../compiler/parse/API";

export const standardLib: Bindings = {
  // Haskell Operators
  $: {
    // Function application
    type: "(a -> b) -> a -> b",
    value: (a, b) => a(b),
    prec: [0, "right"],
  },

  ".": {
    // Function composition
    type: "(b -> c) -> (a -> b) -> a -> c",
    value: (a, b) => (c) => a(b(c)),
    prec: [9, "right"],
  },

  // List functions
  "[]": {
    // Empty list constructor
    type: "[a]",
    value: [],
  },

  ":": {
    // Cons operator
    // TODO: this isn't actually parseable yet, it's only used for
    // typechecking list literals
    type: "a -> [a] -> [a]",
    value: (a, as) => [a, ...as],
    prec: [5, "right"],
  },

  // Arithmetic
  "+": {
    type: "Number -> Number -> Number",
    value: (a, b) => a + b,
    prec: [6, "left"],
  },

  "-": {
    type: "Number -> Number -> Number",
    value: (a, b) => a - b,
    prec: [6, "left"],
  },

  "*": {
    type: "Number -> Number -> Number",
    value: (a, b) => a * b,
    prec: [7, "left"],
  },

  "/": {
    type: "Number -> Number -> Number",
    value: (a, b) => a / b,
    prec: [7, "left"],
  },
};
