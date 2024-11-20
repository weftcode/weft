import { eq } from "../../utils";

import { applyToQualType } from "./Substitution";
import { Kind, Type, kindOf } from "./Type";
import { Predicate, QualType } from "./TypeClass";
import { varsInQualType } from "./Vars";

export interface TypeScheme {
  forAll: Kind[];
  qual: QualType;
}

export function quantify(vs: Type.Var[], qt: QualType): TypeScheme {
  let vs1 = varsInQualType(qt).filter((v) => !vs.some((v1) => eq(v, v1)));

  let s = Object.fromEntries<Type.Gen>(
    vs1.map(({ id }, i) => [id, { is: Type.Is.Gen, num: i }])
  );

  return { forAll: vs1.map((v) => kindOf(v)), qual: applyToQualType(s, qt) };
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
