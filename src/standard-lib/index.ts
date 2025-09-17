import { KFunc, KType, TConst } from "../compiler/typecheck/BuiltIns";
import {
  BindingSpec,
  Environment,
  addDataType,
  addBinding,
  addClass,
  addInstance,
} from "../compiler/environment";

export type BindingsSpec = { [name: string]: Omit<BindingSpec, "name"> };

export default (env: Environment) => {
  env = addDataType(env, { name: "Number", kind: KType, dataCons: [] });
  env = addDataType(env, { name: "String", kind: KType, dataCons: [] });
  env = addDataType(env, {
    name: "Bool",
    kind: KType,
    dataCons: [
      { name: "True", type: "Bool", value: true },
      { name: "False", type: "Bool", value: false },
    ],
  });

  env = addDataType(env, {
    name: "IO",
    kind: KFunc(KType, KType),
    dataCons: [],
  });

  env = addClass(env, {
    name: "NumberLit",
    variable: "a",
    superClasses: [],
    methods: {
      fromNumberLit: { type: "String -> a" },
    },
  });

  env = addInstance(env, {
    preds: [],
    inst: { isIn: "NumberLit", type: TConst("Number") },
    methods: {
      fromNumberLit: { value: (literal: string) => parseFloat(literal) },
    },
  });

  env = addClass(env, {
    name: "StringLit",
    variable: "a",
    superClasses: [],
    methods: {
      fromStringLit: { type: "String -> a" },
    },
  });

  env = addInstance(env, {
    preds: [],
    inst: { isIn: "StringLit", type: TConst("String") },
    methods: {
      fromStringLit: { value: (literal: string) => literal },
    },
  });

  for (let [name, binding] of Object.entries(standardLib)) {
    env = addBinding(env, { name, ...binding });
  }

  // Equality
  env = addClass(env, {
    name: "Eq",
    variable: "a",
    superClasses: [],
    methods: { "==": { type: "a -> a -> Bool" } },
  });

  env = addInstance(env, {
    preds: [],
    inst: { isIn: "Eq", type: TConst("Bool") },
    methods: { "==": { value: (a: boolean, b: boolean) => a == b } },
  });

  return env;
};

const standardLib: BindingsSpec = {
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
};
