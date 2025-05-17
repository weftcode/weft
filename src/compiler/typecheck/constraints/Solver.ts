import { applyToType, combine, Substitution } from "../Substitution";
import { mgu } from "../Unification";
import { Constraint } from "./Constraint";

export function solve(constraints: Constraint[]): Substitution {
  let sub: Substitution = {};

  for (let constraint of constraints) {
    let { left, right } = constraint;
    let newSub = mgu(applyToType(sub, left), applyToType(sub, right));
    sub = combine(newSub, sub);
  }

  return sub;
}
