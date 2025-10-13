// @ts-nocheck

import { TokenType } from "../compiler/scan/TokenType";
import { addBinding, BindingSpec } from "../compiler/environment";
import { validateSpec } from "../weft/src/environment/Type";

import { reify, early, late } from "@strudel/core";

export default (env: Environment) => {
  for (let [name, binding] of Object.entries(operators)) {
    env = addBinding(env, name, validateSpec(name, binding));
  }

  return env;
};

const operators: BindingSpec = {
  // Plain arithmetic operators
  // These should be overloaded eventually, but we're assuming
  // patterns right now
  "+": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a: number, b: number) => reify(a).add.in(reify(b)),
    prec: [6, "left"],
  },

  "-": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a: number, b: number) => reify(a).sub.in(reify(b)),
    prec: [6, "left"],
  },

  "*": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a: number, b: number) => reify(a).mul.in(reify(b)),
    prec: [7, "left"],
  },

  "/": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a: number, b: number) => reify(a).div.in(reify(b)),
    prec: [7, "left"],
  },

  // Addition/subtration
  "|+": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).add.in(reify(b)),
    prec: [6, "left"],
  },
  "|+|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).add.mix(reify(b)),
    prec: [6, "left"],
  },
  "+|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).add.out(reify(b)),
    prec: [6, "left"],
  },
  "|-": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).sub.in(reify(b)),
    prec: [6, "left"],
  },
  "|-|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).sub.mix(reify(b)),
    prec: [6, "left"],
  },
  "-|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).sub.out(reify(b)),

    prec: [6, "left"],
  },

  // Multiplication/division
  "|*": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).mul.in(reify(b)),

    prec: [7, "left"],
  },
  "|*|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).mul.mix(reify(b)),

    prec: [7, "left"],
  },
  "*|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).mul.out(reify(b)),

    prec: [7, "left"],
  },
  "|/": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).div.in(reify(b)),

    prec: [7, "left"],
  },
  "|/|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).div.mix(reify(b)),

    prec: [7, "left"],
  },
  "/|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).div.out(reify(b)),

    prec: [7, "left"],
  },

  // Apply pattern values
  "|<": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(b).set.out(reify(a)),

    prec: [8, "left"],
  },
  "|<|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(b).set.mix(reify(a)),

    prec: [8, "left"],
  },
  "<|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(b).set.in(reify(a)),

    prec: [8, "left"],
  },
  "|>": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).set.in(reify(b)),

    prec: [8, "left"],
  },
  "#": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).set.in(reify(b)),

    prec: [8, "left"],
  },
  "|>|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).set.mix(reify(b)),

    prec: [8, "left"],
  },
  ">|": {
    type: "Pattern a -> Pattern a -> Pattern a",
    value: (a, b) => reify(a).set.out(reify(b)),

    prec: [8, "left"],
  },

  // Time shifts
  "~>": {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: early,
  },

  "<~": {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: late,
  },
};
