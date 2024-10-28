import { Kind, Type } from "./Type";

export const KType: Kind = {
  is: Kind.Is.Type,
};

export function KFunc(left: Kind, right: Kind) {
  return {
    is: Kind.Is.Function,
    left,
    right,
  };
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

export const tUnit = TConst("()");
export const tNumber = TConst("Number");
export const tString = TConst("String");

export const tList = TConst("[]", KFunc(KType, KType));
export const tArrow = TConst("(->)", KFunc(KType, KFunc(KType, KType)));
