import { Expr } from "../../Expr";
import { CoreExpr } from "./CoreExpr";

export function toCore(expression: Expr): CoreExpr {
  switch (expression.type) {
    case Expr.Type.Application:
      return {
        type: "Core_App",
        e1: toCore(expression.left),
        e2: toCore(expression.right),
      };

    case Expr.Type.Variable:
      return {
        type: "Core_Var",
        x: expression.name.lexeme,
      };

    case Expr.Type.Literal:
      return {
        type: "Core_Lit",
        value: expression.value,
      };

    case Expr.Type.Binary: {
      let { left, operator, right } = expression;

      return {
        type: "Core_App",
        e1: {
          type: "Core_App",
          e1: {
            type: "Core_Var",
            x: operator.lexeme,
          },
          e2: toCore(left),
        },
        e2: toCore(right),
      };
    }

    case Expr.Type.Section: {
      // A section is just a binary operation wrapped in a function abstraction. One of the
      // sides of the operator is the variable from the abstraction
      let left: CoreExpr =
        expression.side === "left"
          ? { type: "Core_Var", x: "x" }
          : toCore(expression.expression);
      let right: CoreExpr =
        expression.side === "right"
          ? { type: "Core_Var", x: "x" }
          : toCore(expression.expression);

      return {
        type: "Core_Abs",
        x: "x", // TODO: This should actually be a unique name outside of the namespace
        e: {
          type: "Core_App",
          e1: {
            type: "Core_App",
            e1: { type: "Core_Var", x: expression.operator.lexeme },
            e2: left,
          },
          e2: right,
        },
      };
    }

    case Expr.Type.Unary:
      throw new Error("Parser doesn't currently support unary operators");

    case Expr.Type.Grouping:
      return toCore(expression.expression);

    case Expr.Type.List: {
      // Desugar to a right-associative set of cons operators
      const { items } = expression;

      return items.reduceRight(
        (prev: CoreExpr, item) => ({
          type: "Core_App",
          e1: {
            type: "Core_App",
            e1: {
              type: "Core_Var",
              x: ":",
            },
            e2: toCore(item),
          },
          e2: prev,
        }),
        { type: "Core_Var", x: "[]" }
      );
    }

    case Expr.Type.Empty:
      throw new Error(
        "Tried to convert an empty expression node into a code node"
      );

    case Expr.Type.Assignment:
      throw new Error("Assignment isn't implemented yet");

    default:
      return expression satisfies never;
  }
}
