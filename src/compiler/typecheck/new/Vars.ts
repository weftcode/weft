import { Type } from "./Type";

import { eq } from "../../../utils";

function union<T>(l1: T[], l2: T[]): T[] {
  return l1.concat(l2.filter((v2) => l1.every((v1) => !eq(v1, v2))));
}

export function varsInType(type: Type): Type.Var[] {
  switch (type.is) {
    case Type.Is.Var:
      return [type];
    case Type.Is.App:
      let {left, right} = type;
      return union(varsInType(left), varsInType(right));
    default:
      return [];
  }
},