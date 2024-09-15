import { printType } from "./Printer";
import {
  Context,
  isContext,
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

export const unify = (type1: MonoType, type2: MonoType): Substitution => {
  console.log(type1);
  console.log(type2);
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

  if (type1.C !== type2.C) {
    throw new UnificationError(
      type1,
      type2,
      `Could not unify types (different type functions): ${type1.C} and ${type2.C}`
    );
  }

  if (type1.mus.length !== type2.mus.length) {
    throw new UnificationError(
      type1,
      type2,
      `Could not unify types (different argument lengths): ${type1} and ${type2}`
    );
  }

  let s: Substitution = makeSubstitution({});
  for (let i = 0; i < type1.mus.length; i++) {
    try {
      s = s(unify(s(type1.mus[i]), s(type2.mus[i])));
    } catch (e) {
      if (e instanceof UnificationError) {
        e.type1 = type1;
        e.type2 = type2;
      }

      throw e;
    }
  }
  return s;
};

const contains = (value: MonoType, type2: TypeVariable): boolean => {
  if (value.type === "ty-var") {
    return value.a === type2.a;
  }

  if (value.type === "ty-app") {
    return value.mus.some((t) => contains(t, type2));
  }

  throw new Error("Unknown argument passed to substitution");
};

// export type Type = MonoType;

// export type MonoType =
//   | { type: "Unit" }
//   | {
//       type: "Function";
//       arg: MonoType;
//       return: MonoType;
//     }
//   | { type: "TypeVar"; name: string }
//   | { type: "TypeCon"; name: string; params: MonoType[] };

// export namespace Types {
//   export const Number = { type: "Number" } as const;
//   export const String = { type: "String" } as const;
//   export const Boolean = { type: "Boolean" } as const;
//   export const Function = (argType: Type, returnType: Type) =>
//     ({
//       type: "Function",
//       arg: argType,
//       return: returnType,
//     } as const);
//   export const Operator = (left: Type, right: Type, returnType: Type) =>
//     Types.Function(left, Types.Function(right, returnType));
// }

// export type Substitution = { [name: string]: MonoType };

// function unify(
//   type1: Type,
//   type2: Type,
//   subs: Substitution = {}
// ): Substitution {
//   if (isEqualType(type1, type2)) {
//     return subs;
//   }

//   if (type1.type === "TypeVar") {
//     // TODO: Implement this check
//     // if (contains(type2, type1)) throw new Error('Infinite type detected')

//     return {
//       ...subs,
//       [type1.type]: type2,
//     };
//   }

//   if (type2.type === "TypeVar") {
//     return unify(type2, type1);
//   }

//   if (type1.type === "Function" && type2.type === "Function") {
//     const subs1 = unify(type1.arg, type2.arg, subs);
//     return unify(
//       applySubstitution(type1.return, subs1),
//       applySubstitution(type2.return, subs1),
//       subs1
//     );
//   }

//   throw new Error(
//     `Cannot unify types: ${JSON.stringify(type1)} and ${JSON.stringify(type2)}`
//   );
// }

// function isEqualType(type1: Type, type2: Type): boolean {
//   if (type1.type !== type2.type) {
//     return false;
//   }

//   if (type1.type === "Function" && type2.type === "Function") {
//     return (
//       isEqualType(type1.arg, type2.arg) &&
//       isEqualType(type1.return, type2.return)
//     );
//   }

//   return true;
// }

// function applySubstitution(type: Type, subs: Substitution): Type {
//   if (type.type === "TypeVar" && subs[type.name]) {
//     return subs[type.name];
//   }

//   if (type.type === "Function") {
//     return {
//       type: "Function",
//       arg: applySubstitution(type.arg, subs),
//       return: applySubstitution(type.return, subs),
//     };
//   }

//   return type;
// }
