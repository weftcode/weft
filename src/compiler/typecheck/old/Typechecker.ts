import { Stmt } from "../../parse/AST/Stmt";

import { makeContext, PolyType } from "./Types";
import { W } from "./Inference_W";
import { UnificationError } from "./Utilities";
import { Environment } from "../environment";
import { TypeInfo, applyToExpr, getType } from "./Annotations";

export class TypeChecker {
  private environment: { [name: string]: PolyType };

  constructor(env: Environment) {
    this.environment = Object.fromEntries(
      Object.entries(env.typeEnv).map(([key, { type }]) => [key, type])
    );
  }

  check(statement: Stmt): Stmt<TypeInfo> {
    try {
      switch (statement.is) {
        case Stmt.Is.Expression:
          let [sub, expr] = W(
            makeContext(this.environment),
            statement.expression
          );
          let expression = applyToExpr(expr, sub);
          return { ...statement, expression, type: getType(expression) };
        case Stmt.Is.Error:
          return { ...statement };
        default:
          return statement satisfies never;
      }
    } catch (e) {
      // if (e instanceof UnificationError && e.type2) {
      //   this.reporter.error(0, 0, e.message);
      // }

      throw e;
    }
  }
}
