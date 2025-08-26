import { TConst } from "../compiler/typecheck/BuiltIns";
import { ModuleSpec } from "../weft/src/environment/ModuleSpec";

export default {
  datatypes: {
    Number: {},
    String: {},
    Bool: { constructors: [{ name: "True" }, { name: "False" }] },
    IO: { vars: ["a"] },
  },
  classes: {
    // env = addClass(env, { name: "FromNumber", superClasses: [], methods: {} });
    // env = addClass(env, { name: "FromString", superClasses: [], methods: {} });

    // Equality
    Eq: {
      variable: "a",
      superClasses: [],
      methods: { "==": { type: "a -> a -> Bool" } },
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

// (env: Environment) => {
//   env = addInstance(env, {
//     preds: [],
//     inst: { isIn: "Eq", type: TConst("Bool") },
//     methods: { "==": { value: (a: boolean, b: boolean) => a == b } },
//   });

//   return env;
// };
