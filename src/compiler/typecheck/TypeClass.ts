import { eq } from "../../utils";
import { TypeClassEnv } from "../environment";
import { printType } from "./Printer";
import { applyToPred } from "./Substitution";
import { Type } from "./Type";
import { match, mgu } from "./Unification";

export interface Predicate {
  isIn: string;
  type: Type;
}

export interface QualType {
  preds: Predicate[];
  type: Type;
}

export interface Instance {
  preds: Predicate[];
  inst: Predicate;
}

// Unification and matching on predicates
export function mguPred(p1: Predicate, p2: Predicate) {
  if (p1.isIn !== p2.isIn) {
    throw new Error("Classes differ");
  }

  return mgu(p1.type, p2.type);
}

export function matchPred(p1: Predicate, p2: Predicate) {
  if (p1.isIn !== p2.isIn) {
    throw new Error("Classes differ");
  }

  return match(p1.type, p2.type);
}

// Entailment Judgments
function bySuper(ce: TypeClassEnv, p: Predicate): Predicate[] {
  let { isIn, type } = p;
  let superClasses = ce[isIn]?.superClasses ?? [];
  return [
    p,
    ...superClasses.flatMap((superClass) =>
      bySuper(ce, { isIn: superClass, type })
    ),
  ];
}

export function byInst(ce: TypeClassEnv, pred: Predicate) {
  let { isIn, type } = pred;

  const tryInst = ({ preds, inst }: Instance) => {
    let sub = matchPred(inst, pred);
    return preds.map((p) => applyToPred(sub, p));
  };

  for (let inst of ce[isIn]?.instances ?? []) {
    try {
      return tryInst(inst);
    } catch (e) {}
  }

  throw new Error(
    `No matching instance found for (${isIn} ${printType(type, true)})`
  );
}

function entail(ce: TypeClassEnv, ps: Predicate[], p: Predicate): boolean {
  let checkSupers = ps
    .map((p1) => bySuper(ce, p1))
    .some((ps1) => ps1.some((p2) => eq(p, p2)));

  let checkInst: boolean;

  try {
    checkInst = byInst(ce, p).every((q) => entail(ce, ps, q));
  } catch (e) {
    checkInst = false;
  }

  return checkSupers || checkInst;
}

function normalForm(type: Type): boolean {
  switch (type.is) {
    case Type.Is.Var:
      return true;
    case Type.Is.App:
      return normalForm(type.left);
    default:
      return false;
  }
}

function toHnf(ce: TypeClassEnv, pred: Predicate): Predicate[] {
  if (normalForm(pred.type)) {
    return [pred];
  }

  try {
    return byInst(ce, pred).flatMap((p) => toHnf(ce, p));
  } catch (e) {
    console.log(e);
    throw new Error("context reduction");
  }
}

function simplify(ce: TypeClassEnv, ps: Predicate[]) {
  let rs: Predicate[] = [];
  let p: Predicate;

  while (ps.length > 0) {
    [p, ...ps] = ps;

    // If p is entailed by the existing list of predicates then
    // it can be eliminated. Otherwise, it's treated as necessary
    // and moved to rs
    if (!entail(ce, rs.concat(ps), p)) {
      rs = [p, ...rs];
    }
  }

  return rs;
}

export function reduce(ce: TypeClassEnv, ps: Predicate[]) {
  return simplify(
    ce,
    ps.flatMap((p) => toHnf(ce, p))
  );
}
