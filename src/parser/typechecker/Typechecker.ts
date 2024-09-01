import { Expr } from "../Expr";
import { Stmt } from "../Stmt";
import { Environment } from "../Environment";
import { ErrorReporter } from "../Reporter";

import { Scanner } from "../Scanner";
import { TypeParser } from "./TypeParser";

import { Type } from "./Utilities";

export class TypeChecker {
  private environment = new Environment<Type>();

  constructor(
    private readonly reporter: ErrorReporter,
    bindings: { [name: string]: string }
  ) {
    for (let [name, typeString] of Object.entries(bindings)) {
      let type = new TypeParser(
        new Scanner(typeString, reporter).scanTokens(),
        reporter
      ).parse();

      console.log(`\n${name}:`);
      console.log(JSON.stringify(type, undefined, 2));

      this.environment.define(name, type);
    }
  }

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
        let argType = this.checkExpression(expression.right);
        if (funcType.type !== "Function") {
          throw new Error(`Expected function, got ${funcType.type}`);
        }
        if (!isEqualType(funcType.arg, argType)) {
          throw new Error(
            `Argument type mismatch: expected ${JSON.stringify(
              funcType.arg
            )}, got ${JSON.stringify(argType)}`
          );
        }
        return funcType.return;
      case Expr.Type.Binary:
        let leftType = this.checkExpression(expression.left);
        let operatorType = this.environment.get(expression.operator);
        let rightType = this.checkExpression(expression.right);

        if (
          operatorType.type !== "Function" ||
          operatorType.return.type !== "Function"
        ) {
          throw Error(
            `Operator "${expression.operator.lexeme}" has an incorrect type definition.`
          );
        }

        if (!isEqualType(operatorType.arg, leftType)) {
          throw Error(
            `Type mismatch on left side of operator "${
              expression.operator.lexeme
            }": expected ${JSON.stringify(
              operatorType.arg
            )} and got ${JSON.stringify(leftType)} instead.`
          );
        }

        if (!isEqualType(operatorType.return.arg, rightType)) {
          throw Error(
            `Type mismatch on right side of operator "${
              expression.operator.lexeme
            }": expected ${JSON.stringify(
              operatorType.return.arg
            )} and got ${JSON.stringify(rightType)} instead.`
          );
        }

        return operatorType.return.return;
      case Expr.Type.Unary:
        throw Error("Unary not implemented");
      case Expr.Type.Grouping:
        return this.checkExpression(expression.expression);
      case Expr.Type.Literal:
        switch (typeof expression.value) {
          case "string":
            return { type: "TypeCon", name: "String", params: [] };
          case "number":
            return { type: "TypeCon", name: "Number", params: [] };
          case "boolean":
            return { type: "TypeCon", name: "Boolean", params: [] };
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

  if (t1.type === "TypeCon" && t2.type === "TypeCon") {
    if (t1.name !== t2.name) return false;

    if (t1.params.length !== t2.params.length) return false;

    return t1.params.every((v1, index) => isEqualType(v1, t2.params[index]));
  }

  return true;
}
