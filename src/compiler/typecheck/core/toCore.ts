// @ts-nocheck

import { Expr } from "../../parse/Expr";
import { CoreExpr } from "./CoreExpr";

export function toCore(source: Expr): CoreExpr {
  switch (source.type) {
    case Expr.Type.Application:
      return {
        type: CoreExpr.Type.App,
        e1: toCore(source.left),
        e2: toCore(source.right),
        source,
      };

    case Expr.Type.Variable:
      return {
        type: CoreExpr.Type.Var,
        x: source.name.lexeme,
        source,
      };

    case Expr.Type.Literal:
      return {
        type: CoreExpr.Type.Lit,
        value: source.value,
        source,
      };

    case Expr.Type.Binary: {
      let { left, operator, right } = source;

      return {
        type: CoreExpr.Type.App,
        e1: {
          type: CoreExpr.Type.App,
          e1: {
            type: CoreExpr.Type.Var,
            x: operator.lexeme,
            source: source.operator,
          },
          e2: toCore(left),
          source: null,
        },
        e2: toCore(right),
        source,
      };
    }

    case Expr.Type.Section: {
      // A section is just a binary operation wrapped in a function abstraction. One of the
      // sides of the operator is the variable from the abstraction
      let left: CoreExpr =
        source.side === "left"
          ? { type: CoreExpr.Type.Var, x: "x", source: null }
          : toCore(source.expression);
      let right: CoreExpr =
        source.side === "right"
          ? { type: CoreExpr.Type.Var, x: "x", source: null }
          : toCore(source.expression);

      return {
        type: CoreExpr.Type.Abs,
        x: "x", // TODO: This should actually be a unique name outside of the namespace
        e: {
          type: CoreExpr.Type.App,
          e1: {
            type: CoreExpr.Type.App,
            e1: {
              type: CoreExpr.Type.Var,
              x: source.operator.lexeme,
              source: source.operator,
            },
            e2: left,
            source: null,
          },
          e2: right,
          source,
        },
        source: null,
      };
    }

    case Expr.Type.Grouping:
      return toCore(source.expression);

    case Expr.Type.List: {
      // Desugar to a right-associative set of cons operators
      const { items } = source;

      return items.reduceRight(
        (prev: CoreExpr, item) => ({
          type: CoreExpr.Type.App,
          e1: {
            type: CoreExpr.Type.App,
            e1: {
              type: CoreExpr.Type.Var,
              x: ":",
              source: null,
            },
            e2: toCore(item),
            source: null,
          },
          e2: { ...prev, source: null },
          source,
        }),
        { type: CoreExpr.Type.Var, x: "[]", source }
      );
    }

    case Expr.Type.Empty:
      throw new Error(
        "Tried to convert an empty expression node into a code node"
      );

    case Expr.Type.Assignment:
      throw new Error("Assignment isn't implemented yet");

    default:
      return source satisfies never;
  }
}
