import { Expr } from "../../parse/AST/Expr";
import { Stmt } from "../../parse/AST/Stmt";
import { KType, TFunc } from "../BuiltIns";

import { Environment } from "../environment";

import { Type } from "../Type";
import { Substitution, applyToType } from "../Substitution";
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

export function applyToExpr<T extends Expr<TypeInfo>>(
  expr: T,
  sub: Substitution
): T {
  switch (expr.is) {
    case Expr.Is.Empty:
      return expr;
    case Expr.Is.Literal:
    case Expr.Is.Variable: {
      const { type } = expr;
      return { ...expr, type: type && applyToType(sub, type) };
    }
    case Expr.Is.Application: {
      const { left, right, type } = expr;
      return {
        ...expr,
        left: applyToExpr(left, sub),
        right: applyToExpr(right, sub),
        type: type && applyToType(sub, type),
      };
    }
    case Expr.Is.Binary: {
      const { left, right, operator, type } = expr;
      return {
        ...expr,
        left: applyToExpr(left, sub),
        right: applyToExpr(right, sub),
        operator: applyToExpr(operator, sub),
        type: type && applyToType(sub, type),
      };
    }
    case Expr.Is.Grouping: {
      const { expression } = expr;
      return { ...expr, expression: applyToExpr(expression, sub) };
    }
    case Expr.Is.Section: {
      const { expression, operator, type } = expr;
      return {
        ...expr,
        expression: applyToExpr(expression, sub),
        operator: applyToExpr(operator, sub),
        type: type && applyToType(sub, type),
      };
    }
    case Expr.Is.List: {
      const { items, type } = expr;
      return {
        ...expr,
        items: items.map((item) => applyToExpr(item, sub)),
        type: type && applyToType(sub, type),
      };
    }
    default:
      return expr satisfies never;
  }
}
