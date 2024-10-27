import { Kind, Type } from "./Type";
import { Predicate, QualType } from "./TypeClass";

export interface TypeScheme {
  forAll: Kind[];
  qual: QualType;
}

export function instType(ts: Type[], type: Type): Type {
  switch (type.is) {
    case Type.Is.App:
      const { is, left, right } = type;
      return {
        is,
        left: instType(ts, left),
        right: instType(ts, right),
      };
    case Type.Is.Gen:
      return ts[type.num];
    default:
      return type;
  }
}

export function instPred(ts: Type[], { isIn, type }: Predicate): Predicate {
  return { isIn, type: instType(ts, type) };
}

export function instQualType(ts: Type[], { preds, type }: QualType): QualType {
  return { preds: preds.map((p) => instPred(ts, p)), type: instType(ts, type) };
}
