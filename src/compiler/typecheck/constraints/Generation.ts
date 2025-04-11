import { Expr } from "../../parse/AST/Expr";
import { Stmt } from "../../parse/AST/Stmt";
import { KType, TFunc } from "../BuiltIns";

import { Environment } from "../environment";

import { Type } from "../Type";
import { Inference, freshInst, unify } from "./Monad";

export interface NodeTypeInfo {
  type: Type;
}

export type TypeInfo = {
  "Stmt.Expression": NodeTypeInfo;
  "Expr.Variable": NodeTypeInfo;
  "Expr.Literal": NodeTypeInfo;
  "Expr.Application": NodeTypeInfo;
  "Expr.Binary": NodeTypeInfo;
  "Expr.Section": NodeTypeInfo;
  "Expr.List": NodeTypeInfo;
  "Expr.Grouping": NodeTypeInfo;
  "Expr.Empty": NodeTypeInfo;
} & Stmt.Extension;

export function infer(env: Environment, expr: Expr): Inference<Expr<TypeInfo>> {
  switch (expr.is) {
    // Literals
    case Expr.Is.Literal:
      return Inference.fresh().map((type) => ({
        ...expr,
        type,
      }));

    // Variable
    case Expr.Is.Variable:
      let scheme = env.typeEnv[expr.name.lexeme].type;
      return freshInst(scheme).map(({ type }) => ({ ...expr, type }));

    // Grouping
    case Expr.Is.Grouping:
      return infer(env, expr.expression);

    // Function application
    case Expr.Is.Application:
      return infer(env, expr.left).bind((left) =>
        infer(env, expr.right).bind((right) =>
          Inference.fresh().bind((resultType) =>
            unify(left.type, TFunc(right.type, resultType)).then(
              Inference.pure({
                ...expr,
                left,
                right,
                type: resultType,
              })
            )
          )
        )
      );

    // Special cases of function application
    // case Expr.Is.Binary:
    //   return inferApp(env, {
    //     is: Expr.Is.Application,
    //     left: {
    //       is: Expr.Is.Application,
    //       left: expr.operator,
    //       right: expr.left,
    //     },
    //     right: expr.right,
    //   });

    default:
      throw new Error("Inference is incomplete");
    //return expr satisfies never;
  }
}
