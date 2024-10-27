import { Type } from "./Type";
import { Substitution, combine, applyToType } from "./Substitution";

export function mgu(type1: Type, type2: Type): Substitution {
  if (type1.is === Type.Is.App && type2.is === Type.Is.App) {
    let { left: l1, right: r1 } = type1;
    let { left: l2, right: r2 } = type2;

    let s1 = mgu(l1, l2);
    let s2 = mgu(applyToType(s1, r1), applyToType(s1, r2));
    return combine(s1, s2);
  }

  // Use varBind for cases of type variables
  if (type1.is === Type.Is.Var) {
    return varBind(type1, type2);
  }

  if (type2.is === Type.Is.Var) {
    return varBind(type2, type1);
  }

  if (type1.is === Type.Is.Const && type2.is === Type.Is.Const) {
    if (type1.id === type2.id) {
      return {};
    }
  }

  throw new Error("types do not unify");
}

// function varBind(tyVar: Type.Var, type: Type): Substitution {
//   // Equivalent type variables just need the null substitution
//   if (eq(tyVar, type)) {
//     return {};
//   }

//   if (TypesType.tv(type).some((t) => eq(t, tyVar))) {
//     throw new Error("occurs check fails");
//   }

//   if (eq(Type.kind(tyVar), Type.kind(type))) {
//     throw new Error("kinds do not match");
//   }

//   return [[tyVar, type]];
// }
