import { BindingSpec } from "../compiler/environment";

export type BindingsSpec = { [name: string]: Omit<BindingSpec, "name"> };

export const standardLib: BindingsSpec = {
  // Haskell Operators
  $: {
    // Function application
    type: "(a -> b) -> a -> b",
    value: <X, Y>(a: (x: X) => Y, b: X) => a(b),
    prec: [0, "right"],
  },

  ".": {
    // Function composition
    type: "(b -> c) -> (a -> b) -> a -> c",
    value: <X, Y, Z>(a: (y: Y) => Z, b: (x: X) => Y, c: X) => a(b(c)),
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
    value: <X>(a: X, as: X[]) => [a, ...as],
    prec: [5, "right"],
  },

  // Arithmetic
  "+": {
    type: "Number -> Number -> Number",
    value: (a: number, b: number) => a + b,
    prec: [6, "left"],
  },

  "-": {
    type: "Number -> Number -> Number",
    value: (a: number, b: number) => a - b,
    prec: [6, "left"],
  },

  "*": {
    type: "Number -> Number -> Number",
    value: (a: number, b: number) => a * b,
    prec: [7, "left"],
  },

  "/": {
    type: "Number -> Number -> Number",
    value: (a: number, b: number) => a / b,
    prec: [7, "left"],
  },
};
