import { Expr } from "../../parse/AST/Expr";
import { Stmt } from "../../parse/AST/Stmt";
import { ErrorReporter } from "../../parse/Reporter";

import { TypeScheme } from "../TypeScheme";
// import { inferExpr } from "./Inference";
// import { UnificationError } from "./Utilities";
import { Environment } from "../environment";
import { Constraint } from "./Constraint";
import { infer, TypeInfo, applyToExpr } from "./Generation";
import { Inference } from "./Monad";
import { printConstraint } from "./Printer";
import { solve } from "./Solver";

export class TypeChecker {
  constructor(
    private readonly reporter: ErrorReporter,
    private environment: Environment
  ) {}

  check(statement: Stmt) {
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
        let { substitution, errors } = solve(constraints);
        expression = applyToExpr(expression, substitution);
        return { ...statement, expression };
      default:
        return statement.is satisfies never;
    }
  }
}
