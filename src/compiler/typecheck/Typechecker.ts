import { Stmt } from "../parse/AST/Stmt";
import { ErrorReporter } from "../parse/Reporter";

import { makeContext, PolyType } from "./Types";
import { W } from "./Inference";
import { UnificationError } from "./Utilities";
import { Environment } from "../environment";
import { applyToExpr } from "./Annotations";

export class TypeChecker {
  private environment: { [name: string]: PolyType };

  constructor(private readonly reporter: ErrorReporter, env: Environment) {
    this.environment = Object.fromEntries(
      Object.entries(env.typeEnv).map(([key, { type }]) => [key, type])
    );
  }

  check(statement: Stmt) {
    try {
      switch (statement.is) {
        case Stmt.Is.Expression:
          let [sub, expr] = W(
            makeContext(this.environment),
            statement.expression
          );
          return { ...statement, expression: applyToExpr(expr, sub) };
        default:
          return statement.is satisfies never;
      }
    } catch (e) {
      if (e instanceof UnificationError && e.type2) {
        this.reporter.error(0, 0, e.message);
      }

      throw e;
    }
  }
}
