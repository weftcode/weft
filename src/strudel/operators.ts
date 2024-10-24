import { Bindings } from "../compiler/parse/API";

import { reify } from "@strudel/core";

export const operators: Bindings = {
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
    synonyms: ["#"],
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
};
