import { printType } from "./Printer";
import {
  Context,
  isContext,
  LiteralType,
  makeContext,
  MonoType,
  PolyType,
  TypeVariable,
} from "./Types";

// substitutions

export type Substitution = {
  type: "substitution";
  (m: MonoType): MonoType;
  (t: PolyType): PolyType;
  (c: Context): Context;
  (s: Substitution): Substitution;
  raw: { [typeVariables: string]: MonoType };
};

export const makeSubstitution = (raw: Substitution["raw"]): Substitution => {
  const fn = ((arg: MonoType | PolyType | Context | Substitution) => {
    if (arg.type === "substitution") return combine(fn, arg);
    return apply(fn, arg);
  }) as Substitution;
  fn.type = "substitution";
  fn.raw = raw;
  return fn;
};

function apply<T extends MonoType | PolyType | Context>(
  substitution: Substitution,
  value: T
): T;
function apply(
  s: Substitution,
  value: MonoType | PolyType | Context
): MonoType | PolyType | Context {
  if (isContext(value)) {
    return makeContext(
      Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, apply(s, v)])
      )
    );
  }

  if (value.type === "ty-var") {
    if (s.raw[value.a]) return s.raw[value.a];
    return value;
  }

  if (value.type === "ty-app") {
    return { ...value, mus: value.mus.map((m) => apply(s, m)) };
  }

  if (value.type === "ty-quantifier") {
    const substitutionWithoutQuantifier = makeSubstitution(
      Object.fromEntries(
        Object.entries(s.raw).filter(([k, v]) => k !== value.a)
      )
    );
    return {
      ...value,
      sigma: apply(substitutionWithoutQuantifier, value.sigma),
    };
  }

  if (value.type === "ty-lit") {
    return value;
  }

  throw new Error("Unknown argument passed to substitution");
}

const combine = (s1: Substitution, s2: Substitution): Substitution => {
  return makeSubstitution({
    ...s1.raw,
    ...Object.fromEntries(Object.entries(s2.raw).map(([k, v]) => [k, s1(v)])),
  });
};

// new type variable
let currentTypeVar = 0;
export const newTypeVar = (): TypeVariable => ({
  type: "ty-var",
  a: `t${currentTypeVar++}`,
});

// instantiate
// mappings = { a |-> t0, b |-> t1 }
// Va. Vb. a -> b
// t0 -> t1
export const instantiate = (
  type: PolyType,
  mappings: Map<string, TypeVariable> = new Map()
): MonoType => {
  if (type.type === "ty-var") {
    return mappings.get(type.a) ?? type;
  }

  if (type.type === "ty-app") {
    return { ...type, mus: type.mus.map((m) => instantiate(m, mappings)) };
  }

  if (type.type === "ty-quantifier") {
    mappings.set(type.a, newTypeVar());
    return instantiate(type.sigma, mappings);
  }

  throw new Error("Unknown type passed to instantiate");
};

// generalise
export const generalise = (ctx: Context, type: MonoType): PolyType => {
  const quantifiers = diff(freeVars(type), freeVars(ctx));
  let t: PolyType = type;
  quantifiers.forEach((q) => {
    t = { type: "ty-quantifier", a: q, sigma: t };
  });
  return t;
};

const diff = <T>(a: T[], b: T[]): T[] => {
  const bset = new Set(b);
  return a.filter((v) => !bset.has(v));
};

const freeVars = (value: PolyType | Context): string[] => {
  if (isContext(value)) {
    return Object.values(value).flatMap(freeVars);
  }

  if (value.type === "ty-var") {
    return [value.a];
  }

  if (value.type === "ty-app") {
    return value.mus.flatMap(freeVars);
  }

  if (value.type === "ty-quantifier") {
    return freeVars(value.sigma).filter((v) => v !== value.a);
  }

  if (value.type === "ty-lit") {
    return [];
  }

  throw new Error("Unknown argument passed to substitution");
};

// unify

export class UnificationError extends Error {
  constructor(
    public type1: PolyType,
    public type2: PolyType,
    message?: string
  ) {
    super();

    // Set unification error message
    this.message =
      message ??
      `Types don't match: expected ${this.type1String}, got ${this.type2String}`;
  }

  get type1String() {
    return printType(this.type1);
  }

  get type2String() {
    return printType(this.type2);
  }
}

export function unify(type1: MonoType, type2: MonoType): Substitution | null {
  if (
    type1.type === "ty-var" &&
    type2.type === "ty-var" &&
    type1.a === type2.a
  ) {
    return makeSubstitution({});
  }

  if (type1.type === "ty-var") {
    if (contains(type2, type1)) throw new Error("Infinite type detected");

    return makeSubstitution({
      [type1.a]: type2,
    });
  }

  if (type2.type === "ty-var") {
    return unify(type2, type1);
  }

  // Special-casing literals
  if (type1.type === "ty-lit") {
    return unifyLiteral(type1, type2);
  }

  if (type2.type === "ty-lit") {
    return unifyLiteral(type2, type1);
  }

  if (type1.C !== type2.C) {
    return null;
  }

  if (type1.mus.length !== type2.mus.length) {
    return null;
  }

  let s: Substitution = makeSubstitution({});
  for (let i = 0; i < type1.mus.length; i++) {
    let unified = unify(s(type1.mus[i]), s(type2.mus[i]));

    if (!unified) return null;

    s = s(unified);
  }

  return s;
}

let litVar = 0;

function unifyLiteral(type1: LiteralType, type2: MonoType) {
  if (type1.litType === "string") {
    return (
      // String literals unify with a string or with an arbitrary pattern (as mininotation)
      unify({ type: "ty-app", C: "String", mus: [] }, type2) ??
      unify(
        {
          type: "ty-app",
          C: "Pattern",
          mus: [{ type: "ty-var", a: `litvar${litVar++}` }],
        },
        type2
      )
    );
  } else {
    return (
      // Numeric literals unify with a number or with a pattern of numbers
      unify({ type: "ty-app", C: "Number", mus: [] }, type2) ??
      unify(
        {
          type: "ty-app",
          C: "Pattern",
          mus: [{ type: "ty-app", C: "Number", mus: [] }],
        },
        type2
      )
    );
  }
}

const contains = (value: MonoType, type2: TypeVariable): boolean => {
  if (value.type === "ty-var") {
    return value.a === type2.a;
  }

  if (value.type === "ty-app") {
    return value.mus.some((t) => contains(t, type2));
  }

  if (value.type === "ty-lit") {
    return false;
  }

  throw new Error("Unknown argument passed to substitution");
};
