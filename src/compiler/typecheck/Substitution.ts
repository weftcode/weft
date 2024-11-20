import { Type } from "./Type";
import { Predicate, QualType } from "./TypeClass";
import { TypeScheme } from "./TypeScheme";

export type Substitution = { [tyvar: string]: Type };

export function combine(s1: Substitution, s2: Substitution) {
  return {
    ...s1,
    ...Object.fromEntries(
      Object.entries(s2).map(([k, v]) => [k, applyToType(s1, v)])
    ),
  };
}

export function applyToType(s: Substitution, t: Type): Type {
  switch (t.is) {
    case Type.Is.Var:
      return s[t.id] ?? t;
    case Type.Is.App:
      const { is, left, right } = t;
      return { is, left: applyToType(s, left), right: applyToType(s, right) };
    default:
      return t;
  }
}

export function applyToPred(
  s: Substitution,
  { isIn, type }: Predicate
): Predicate {
  return {
    isIn,
    type: applyToType(s, type),
  };
}

export function applyToQualType(
  s: Substitution,
  { preds, type }: QualType
): QualType {
  return {
    preds: preds.map((p) => applyToPred(s, p)),
    type: applyToType(s, type),
  };
}

export function applyToScheme(
  s: Substitution,
  { forAll, qual }: TypeScheme
): TypeScheme {
  return {
    forAll,
    qual: applyToQualType(s, qual),
  };
}
