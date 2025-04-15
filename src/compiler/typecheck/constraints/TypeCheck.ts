import { Expr } from "../../parse/AST/Expr";
import { Stmt } from "../../parse/AST/Stmt";
import { ErrorReporter } from "../../parse/Reporter";

import { TypeScheme } from "../TypeScheme";
// import { inferExpr } from "./Inference";
// import { UnificationError } from "./Utilities";
import { Environment } from "../environment";
import { infer, TypeInfo, applyToExpr } from "./Generation";
import { Constraint, Inference } from "./Monad";
import { printConstraint } from "./Printer";
import { solve } from "./Solver";

export class TypeChecker {
  constructor(
    private readonly reporter: ErrorReporter,
    private environment: Environment
  ) {}

  check(statement: Stmt) {
    try {
      switch (statement.is) {
        case Stmt.Is.Expression:
          let [expression, constraints] = infer(
            this.environment,
            statement.expression
          )
            .bind<[Expr<TypeInfo>, Constraint[]]>((elaborated) =>
              Inference.getConstraints.map((constraints) => [
                elaborated,
                constraints,
              ])
            )
            .run();
          console.log("Constraints:");
          for (let ct of constraints) {
            console.log(printConstraint(ct));
          }
          let substitution = solve(constraints);
          console.log(substitution);
          expression = applyToExpr(expression, substitution);
          return { ...statement, expression };
        default:
          return statement.is satisfies never;
      }
    } catch (e) {
      // if (e instanceof UnificationError && e.type2) {
      //   this.reporter.error(0, 0, e.message);
      // }

      throw e;
    }
  }
}
