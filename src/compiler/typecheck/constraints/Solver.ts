import { applyToType, combine, Substitution } from "../Substitution";
import { mgu } from "../Unification";
import { Constraint } from "./Monad";

export function solve(constraints: Constraint[]): Substitution {
  let sub: Substitution = {};

  for (let constraint of constraints) {
    let [type1, type2] = constraint;
    let newSub = mgu(applyToType(sub, type1), applyToType(sub, type2));
    sub = combine(sub, newSub);
  }

  return sub;
}
