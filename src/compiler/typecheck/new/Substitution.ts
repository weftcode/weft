import { MonoType, PolyType } from "../Types";

export type Substitution = { [tyvar: string]: MonoType };

export function combine(s1: Substitution, s2: Substitution) {
  return {
    ...s1,
    ...Object.fromEntries(
      Object.entries(s2).map(([k, v]) => [k, applyType(s1, v)])
    ),
  };
}

export function applyType(s: Substitution, t: MonoType) {
  switch (t.type) {
    case "ty-var":
      return s[t.a] ?? t;
    case "ty-app":
      return { ...t, mus: t.mus.map((m) => applyType(s, m)) };
    default:
      return t satisfies never;
  }
}

export function applyScheme(sub: Substitution, type: PolyType) {}
