// Implementation of constraint-solving type inference based on
// Generalizing Hindley-Milner Type Inference Algorithms
// by Heeren & Hage (2002)

type Constraint = Constraint.Eq; //| Constraint.Dict;

import { Expr } from "../../parse/Expr";
import {
  MonoType,
  PolyType,
  TypeVariable,
  TypeFunctionApplication,
} from "../old/Types";

export namespace Constraint {
  export enum Type {
    Eq = "Equality",
    // Dict = "Dictionary",
  }

  interface Common {}

  export interface Eq extends Common {
    type: Type.Eq;
    lhs: MonoType;
    rhs: MonoType;
  }

  // export interface Dict extends Common {
  //   type: Type.Dict;
  // }
}

type Assumption = [string, TypeVariable];

type Substitution = { [tyvar: string]: MonoType };

// Fresh type variables

let varCounter = 0;

function freshTyVar(): TypeVariable {
  return {
    type: "ty-var",
    a: `t${varCounter++}`,
  };
}

// Bottom-up typing judgement

interface BUJudgement {
  sub: Substitution;
  assump: Assumption[];
  expr: Expr;
  type: PolyType;
}

// function BottomUp({ sub, assump, expr, type }: BUJudgement): BUJudgement {
//   switch (expr.type) {
//     // LIT
//     case Expr.Type.Literal:
//       let type: TypeFunctionApplication;

//       switch (typeof expr.value) {
//         case "string":
//           type = {
//             type: "ty-app",
//             C: "String",
//             mus: [],
//           };
//       }

//       return {
//         sub: {},
//         assump: [],
//         expr,
//         type,
//       };

//     case Expr.Type.Variable:
//   }
// }
