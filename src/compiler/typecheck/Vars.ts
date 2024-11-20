import { Type } from "./Type";

import { eq } from "../../utils";
import { Predicate, QualType } from "./TypeClass";
import { TypeScheme } from "./TypeScheme";

function nub<T>(l: T[]): T[] {
  if (l.length === 0) return [];

  let [head, ...rest] = l;

  rest = rest.filter((v) => !eq(v, head));

  return [head, ...nub(rest)];
}

export function union<T>(l1: T[], l2: T[]): T[] {
  return l1.concat(l2.filter((v2) => l1.every((v1) => !eq(v1, v2))));
}

export function varsInType(type: Type): Type.Var[] {
  switch (type.is) {
    case Type.Is.Var:
      return [type];
    case Type.Is.App:
      let { left, right } = type;
      return union(varsInType(left), varsInType(right));
    default:
      return [];
  }
}

export function varsInPred({ type }: Predicate): Type.Var[] {
  return varsInType(type);
}

export function varsInQualType({ preds, type }: QualType): Type.Var[] {
  return union(nub(preds.flatMap(varsInPred)), varsInType(type));
}

export function varsInTypeScheme({ qual }: TypeScheme): Type.Var[] {
  return varsInQualType(qual);
}
