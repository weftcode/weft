import { Type } from "../Type";
import { applyToType, combine, Substitution } from "../Substitution";
import { mgu } from "../Unification";
import { Constraint } from "./Constraint";

interface Solution {
  substitution: Substitution;
  errors: SolverError[];
}

export function solve(constraints: Constraint[]): Solution {
  let substitution: Substitution = {};
  let errors: SolverError[] = [];

  for (let constraint of constraints) {
    let { left, right } = constraint;

    try {
      let newSub = mgu(
        applyToType(substitution, left),
        applyToType(substitution, right)
      );
      substitution = combine(newSub, substitution);
    } catch (e) {
      if (
        typeof e === "object" &&
        e !== null &&
        "message" in e &&
        typeof e.message === "string"
      ) {
        errors.push({ message: e.message });
      } else {
        throw e;
      }
    }
  }

  return { substitution, errors };
}

export interface SolverError {
  message: string;
}
