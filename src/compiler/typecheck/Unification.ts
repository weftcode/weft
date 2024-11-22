import { kindOf, Type } from "./Type";
import { Substitution, combine, applyToType, merge } from "./Substitution";

import { printType } from "./Printer";

import { eq } from "../../utils";
import { varsInType } from "./Vars";

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

  throw new Error(
    `Type Error: Can't unify "${printType(type1)}" with ${printType(type2)}`
  );
}

function varBind(tyVar: Type.Var, type: Type): Substitution {
  // Equivalent type variables just need the null substitution
  if (eq(tyVar, type)) {
    return {};
  }

  if (varsInType(type).some((t) => eq(t, tyVar))) {
    throw new Error("occurs check fails");
  }

  if (!eq(kindOf(tyVar), kindOf(type))) {
    throw new Error("kinds do not match");
  }

  return { [tyVar.id]: type };
}

export function match(type1: Type, type2: Type): Substitution {
  if (type1.is === Type.Is.App && type2.is === Type.Is.App) {
    let { left: l1, right: r1 } = type1;
    let { left: l2, right: r2 } = type2;

    let s1 = match(l1, l2);
    let s2 = match(applyToType(s1, r1), applyToType(s1, r2));
    return merge(s1, s2);
  }

  if (type1.is === Type.Is.Var) {
    if (eq(kindOf(type1), kindOf(type2))) {
      return { [type1.id]: type2 };
    }
  }

  if (type1.is === Type.Is.Const && type2.is === Type.Is.Const) {
    if (type1.id === type2.id) {
      return {};
    }
  }

  throw new Error("types do not match");
}
