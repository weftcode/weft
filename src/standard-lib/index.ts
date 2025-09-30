import { ModuleSpec } from "../weft/src/environment/ModuleSpec";
import { InstanceSpec } from "../weft/src/environment/TypeClass";

const primitiveEquality: InstanceSpec = {
  methods: {
    "==": { value: (a: any, b: any) => a === b },
  },
};

export default {
  datatypes: {
    Number: {},
    String: {},
    Bool: {
      constructors: [
        { name: "True", value: true },
        { name: "False", value: false },
      ],
    },
    IO: { vars: ["a"] },
  },
  classes: {
    "NumberLit a": {
      methods: {
        fromNumberLit: { type: "String -> a" },
      },
    },

    "StringLit a": {
      methods: {
        fromStringLit: { type: "String -> a" },
      },
    },

    // Equality
    "Eq a": {
      methods: { "==": { type: "a -> a -> Bool" } },
    },
  },
  instances: {
    "Eq Bool": primitiveEquality,
    "Eq Number": primitiveEquality,
    "Eq String": primitiveEquality,

    "Eq a => Eq [a]": {
      methods: <A>(eqA: any) => ({
        "==": {
          value: (as: A[], bs: A[]) =>
            as.length === bs.length && as.every((a, i) => eqA["=="](a, bs[i])),
        },
      }),
    },

    "NumberLit Number": {
      methods: {
        fromNumberLit: { value: (literal: string) => parseFloat(literal) },
      },
    },

    "StringLit String": {
      methods: {
        fromStringLit: { value: (literal: string) => literal },
      },
    },
  },
  vars: {
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
    // "+": {
    //   type: "Number -> Number -> Number",
    //   value: (a: number, b: number) => a + b,
    //   prec: [6, "left"],
    // },

    // "-": {
    //   type: "Number -> Number -> Number",
    //   value: (a: number, b: number) => a - b,
    //   prec: [6, "left"],
    // },

    // "*": {
    //   type: "Number -> Number -> Number",
    //   value: (a: number, b: number) => a * b,
    //   prec: [7, "left"],
    // },

    // "/": {
    //   type: "Number -> Number -> Number",
    //   value: (a: number, b: number) => a / b,
    //   prec: [7, "left"],
    // },

    id: {
      type: "a -> a",
      value: <A>(a: A) => a,
    },
  },
} satisfies ModuleSpec;
