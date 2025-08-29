import { Expr } from "../parse/AST/Expr";
import { Stmt } from "../parse/AST/Stmt";
import { TApp, TFunc, tList } from "./BuiltIns";

import { Environment } from "../environment";

import { Type } from "./Type";
import { TypeExt } from "./ASTExtensions";
import { Substitution, applyToType } from "./Substitution";
import { mapList } from "../utils/State";
import { Infer } from "./Infer";
import { RenamerExt } from "../rename/ASTExtensions";

export function infer(
  env: Environment,
  expr: Expr<RenamerExt>
): Infer<Expr<TypeExt>> {
  switch (expr.is) {
    // Literals
    case Expr.Is.Literal:
      return Infer.fresh().map((type) => ({
        ...expr,
        type,
      }));

    // Variable
    case Expr.Is.Variable:
      if (expr.missing) {
        // If we're missing a variable, treat it as a typed hole
        return Infer.fresh().map((type) => ({ ...expr, type }));
      } else {
        let scheme = env.typeEnv[expr.name.lexeme].type;
        return Infer.freshInst(scheme).map(({ type }) => ({ ...expr, type }));
      }

    // Grouping
    case Expr.Is.Grouping:
      return infer(env, expr.expression);

    // List Literals
    case Expr.Is.List:
      return Infer.fresh().bind((itemType) =>
        mapList(
          (rawItem) =>
            infer(env, rawItem).bind((item) =>
              Infer.unify(itemType, item.type, item).then(Infer.of(item))
            ),
          expr.items
        ).bind((items) =>
          Infer.of({
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
          Infer.fresh().bind((argType) =>
            Infer.fresh().bind((resultType) =>
              Infer.unify(left.type, TFunc(argType, resultType), left).then(
                Infer.unify(argType, right.type, right).then(
                  Infer.of({
                    ...expr,
                    left,
                    right,
                    type: resultType,
                  })
                )
              )
            )
          )
        )
      );

    // Infix binary operations
    case Expr.Is.Binary:
      return infer(env, expr.left).bind((left) =>
        infer(env, expr.operator).bind((operator) =>
          infer(env, expr.right).bind((right) =>
            Infer.fresh().bind((resultType) =>
              Infer.unify(
                operator.type,
                TFunc(left.type, TFunc(right.type, resultType)),
                right
              ).then(
                Infer.of({
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
          Infer.fresh().bind((argType) =>
            Infer.fresh().bind((resultType) =>
              Infer.unify(
                operator.type,
                expr.side === "left"
                  ? TFunc(argType, TFunc(expression.type, resultType))
                  : TFunc(expression.type, TFunc(argType, resultType)),
                expression
              ).then(
                Infer.of({
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
      return Infer.fresh().map((type) => ({ ...expr, type }));

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
