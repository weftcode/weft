import { applyToType, combine, Substitution } from "./Substitution";
import { mgu } from "./Unification";
import { Constraint } from "./Constraint";
import { expressionBounds } from "../parse/Utils";
import { Type } from "./Type";

import { printType } from "./Printer";

import { Expr } from "../parse/AST/Expr";

interface Solution {
  substitution: Substitution;
  errors: SolverError[];
}

export function solve(constraints: Constraint[]): Solution {
  let substitution: Substitution = {};
  let unificationErrors: Required<UnificationError>[] = [];

  for (let constraint of constraints) {
    let { left, right, source } = constraint;

    try {
      let newSub = mgu(
        applyToType(substitution, left),
        applyToType(substitution, right)
      );
      substitution = combine(newSub, substitution);
    } catch (e) {
      if (isUnificationError(e)) {
        unificationErrors.push({ ...e, left, right, source });
      } else {
        throw e;
      }
    }
  }

  let errors: SolverError[] = unificationErrors.map(
    ({ left, right, source }) => ({
      message: `Type mismatch: Expected type (${printType(
        applyToType(substitution, left)
      )}) but got (${printType(applyToType(substitution, right))}) instead`,
      ...expressionBounds(source),
    })
  );

  return { substitution, errors };
}

export function isUnificationError(error: unknown): error is UnificationError {
  return (
    typeof error === "object" &&
    error !== null &&
    "is" in error &&
    error.is === "Unification"
  );
}

export interface UnificationError {
  is: "Unification";
  left: Type;
  right: Type;
  source?: Expr;
}

export interface SolverError {
  message: string;
  from: number;
  to: number;
}
