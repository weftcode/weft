import {
  applyToPred,
  applyToType,
  combine,
  Substitution,
} from "./Substitution";
import { mgu, match } from "./Unification";
import { Constraint } from "./Constraint";
import { expressionBounds } from "../parse/Utils";
import { Type } from "./Type";

import { printConstraint, printPred, printType } from "./Printer";

import { Expr } from "../parse/AST/Expr";
import { TypeClassEnv } from "../environment";
import { byInst, entail } from "./TypeClass";

interface Solution {
  substitution: Substitution;
  errors: SolverError[];
}

export function solve(constraints: Constraint[], env: TypeClassEnv): Solution {
  let { substitution, errors } = solveEq(constraints.filter(isEqConstraint));

  errors.push(
    ...solveClass(substitution, constraints.filter(isClassConstraint), env)
  );

  return { substitution, errors };
}

function isEqConstraint(
  constraint: Constraint
): constraint is Constraint.Equality {
  return constraint.is === Constraint.Is.Equality;
}

function isClassConstraint(
  constraint: Constraint
): constraint is Constraint.Class {
  return constraint.is === Constraint.Is.Class;
}

function solveEq(constraints: Constraint.Equality[]): Solution {
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

function solveClass(
  substitution: Substitution,
  constraints: Constraint.Class[],
  env: TypeClassEnv
) {
  let errors: SolverError[] = [];

  for (let { source, pred } of constraints) {
    pred = applyToPred(substitution, pred);
    console.log(`Checking constraint: ${printPred(pred)}`);
    if (entail(env, [], pred)) {
      // TODO: Collect dictionaries
      for (let inst of env[pred.isIn]?.instances ?? []) {
        console.log(inst);
      }
    } else {
      let { isIn, type } = pred;
      errors.push({
        message: `Couldn't find an instance of the class ${isIn} for type ${printType(
          type
        )}`,
        ...expressionBounds(source),
      });
    }
  }

  return errors;
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
