import { Kind, Type } from "./Type";

import { eq } from "../../utils";
import { TypeScheme } from "./TypeScheme";

export const KType: Kind = {
  is: Kind.Is.Type,
};

export function KFunc(left = KType, right = KType) {
  return {
    is: Kind.Is.Function,
    left,
    right,
  };
}

export function TVar(id: string, kind = KType): Type.Var {
  return { is: Type.Is.Var, id, kind };
}

export function TConst(id: string, kind = KType): Type.Const {
  return {
    is: Type.Is.Const,
    id,
    kind,
  };
}

export function TApp(left: Type, right: Type): Type.App {
  return {
    is: Type.Is.App,
    left,
    right,
  };
}

export function TFunc(left: Type, right: Type): Type.App {
  return TApp(TApp(tArrow, left), right);
}

export function TTuple(arity: number) {
  // Assume arity >= 2
  let kind = KType;
  for (let i = 0; i < arity - 1; ++i) {
    kind = KFunc(KType, kind);
  }

  return TConst(`(${",".repeat(arity - 1)})`, kind);
}

export const tUnit = TConst("()");
export const tNumber = TConst("Number");
export const tString = TConst("String");

export const tList = TConst("[]", KFunc(KType, KType));
export const tArrow = TConst("(->)", KFunc(KType, KFunc(KType, KType)));

interface FnType {
  left: Type;
  right: Type;
}

export function asFnType(type: Type): FnType | null {
  if (type.is !== Type.Is.App) {
    return null;
  }

  const { left, right } = type;

  if (left.is !== Type.Is.App || !eq(left.left, tArrow)) {
    return null;
  }

  return { left: left.right, right };
}

export function asScheme(type: Type): TypeScheme {
  return { forAll: [], qual: { preds: [], type } };
}
