import { Expr } from "./Expr";
import { Stmt } from "./Stmt";
import { Environment } from "./Environment";
import { ErrorReporter } from "./Reporter";

type Type =
  | { type: "Number" }
  | { type: "String" }
  | { type: "Boolean" }
  | {
      type: "Pattern";
      data: Type;
    }
  | { type: "List"; data: Type }
  | {
      type: "Function";
      arg: Type;
      return: Type;
    };

export class TypeChecker {
  constructor(
    private readonly reporter: ErrorReporter,
    private environment: Environment<Type>
  ) {}

  check(statements: Stmt[]) {
    for (let statement of statements) {
      switch (statement.type) {
        case Stmt.Type.Expression:
          this.checkExpression(statement.expression);
          break;
        default:
          return statement.type satisfies never;
      }
    }
  }

  private checkExpression(expression: Expr): Type {
    switch (expression.type) {
      case Expr.Type.Assignment:
        throw Error("Assignment not implemented");
      case Expr.Type.Application:
        let funcType = this.checkExpression(expression.left);
        let argType = this.checkExpression(expression.left);
        if (funcType.type !== "Function") {
          throw new Error(`Expected function, got ${funcType.type}`);
        }
        if (!isEqualType(funcType.arg, argType)) {
          throw new Error(
            `Argument type mismatch: expected ${funcType.arg}, got ${argType}`
          );
        }
        return funcType.return;
      case Expr.Type.Binary:
        throw Error("Binary not implemented");
      case Expr.Type.Unary:
        throw Error("Unary not implemented");
      case Expr.Type.Grouping:
        return this.checkExpression(expression.expression);
      case Expr.Type.Literal:
        switch (typeof expression.value) {
          case "string":
            return { type: "String" };
          case "number":
            return { type: "Number" };
          case "boolean":
            return { type: "Boolean" };
        }
      case Expr.Type.Variable:
        return this.environment.get(expression.name);
      default:
        return expression satisfies never;
    }
  }
}

function isEqualType(t1: Type, t2: Type) {
  if (t1.type !== t2.type) {
    return false;
  }

  if (t1.type === "Function" && t2.type === "Function") {
    return isEqualType(t1.arg, t2.arg) && isEqualType(t1.return, t2.return);
  }

  return true;
}
