import { Expr } from "../parse/AST/Expr";
import { Stmt } from "../parse/AST/Stmt";
import { TApp, TFunc, tList } from "./BuiltIns";

import { Environment } from "../environment";

import { Type } from "./Type";
import { TypeExt } from "./ASTExtensions";
import { Substitution, applyToType } from "./Substitution";
import { Inference, freshInst, unify } from "./Monad";
import { RenamerExt } from "../rename/ASTExtensions";

export function infer(
  env: Environment,
  expr: Expr<RenamerExt>
): Inference<Expr<TypeExt>> {
  switch (expr.is) {
    // Literals
    case Expr.Is.Literal:
      return Inference.fresh().map((type) => ({
        ...expr,
        type,
      }));

    // Variable
    case Expr.Is.Variable:
      if (expr.missing) {
        // If we're missing a variable, treat it as a typed hole
        return Inference.fresh().map((type) => ({ ...expr, type }));
      } else {
        let scheme = env.typeEnv[expr.name.lexeme].type;
        return freshInst(scheme).map(({ type }) => ({ ...expr, type }));
      }

    // Grouping
    case Expr.Is.Grouping:
      return infer(env, expr.expression);

    // List Literals
    case Expr.Is.List:
      return Inference.fresh().bind((itemType) =>
        Inference.mapList(
          (rawItem) =>
            infer(env, rawItem).bind((item) =>
              unify(itemType, item.type, item).then(Inference.pure(item))
            ),
          expr.items
        ).bind((items) =>
          Inference.pure({
            ...expr,
            items,
            type: TApp(tList, itemType),
          })
        )
      );

    // Function application
    case Expr.Is.Application:
      return infer(env, expr.left).bind((left) =>
        infer(env, expr.right).bind((right) =>
          Inference.fresh().bind((resultType) =>
            unify(left.type, TFunc(right.type, resultType), right).then(
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

    // Infix binary operations
    case Expr.Is.Binary:
      return infer(env, expr.left).bind((left) =>
        infer(env, expr.operator).bind((operator) =>
          infer(env, expr.right).bind((right) =>
            Inference.fresh().bind((resultType) =>
              unify(
                operator.type,
                TFunc(left.type, TFunc(right.type, resultType)),
                right
              ).then(
                Inference.pure({
                  ...expr,
                  left,
                  right,
                  // TODO: The type of `infer` doesn't offer a guarantee that
                  //   the type of the elaborated expression is preserved
                  //   This cast is a stop-gap until I have a better solution.
                  operator: operator as Expr.Variable<TypeExt>,
                  type: resultType,
                })
              )
            )
          )
        )
      );

    // Sections
    case Expr.Is.Section:
      return infer(env, expr.expression).bind((expression) =>
        infer(env, expr.operator).bind((operator) =>
          Inference.fresh().bind((argType) =>
            Inference.fresh().bind((resultType) =>
              unify(
                operator.type,
                expr.side === "left"
                  ? TFunc(argType, TFunc(expression.type, resultType))
                  : TFunc(expression.type, TFunc(argType, resultType)),
                expression
              ).then(
                Inference.pure({
                  ...expr,
                  expression,
                  // See above
                  operator: operator as Expr.Variable<TypeExt>,
                  type: TFunc(argType, resultType),
                })
              )
            )
          )
        )
      );

    case Expr.Is.Empty:
    case Expr.Is.Error:
      // Treat this as an expression of totally unknown type
      return Inference.fresh().map((type) => ({ ...expr, type }));

    default:
      return expr satisfies never;
  }
}

export function applyToExpr<T extends Expr<TypeExt>>(
  expr: T,
  sub: Substitution
): T {
  switch (expr.is) {
    case Expr.Is.Empty:
    case Expr.Is.Error:
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
