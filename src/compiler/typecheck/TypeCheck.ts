import { Expr } from "../parse/AST/Expr";
import { Stmt } from "../parse/AST/Stmt";

import { TypeScheme } from "./TypeScheme";
import { Environment } from "../environment";
import { Constraint } from "./Constraint";
import { infer, applyToExpr } from "./Generation";
import { TypeExt } from "./ASTExtensions";
import { Infer } from "./Infer";
import { printConstraint } from "./Printer";
import { solve, SolverError } from "./Solver";

export function typecheckStmt(
  statement: Stmt,
  env: Environment
): [Stmt<TypeExt>, SolverError[]] {
  switch (statement.is) {
    case Stmt.Is.Expression:
      let {
        value: [expression, constraints],
      } = infer(env, statement.expression)
        .bind<[Expr<TypeExt>, Constraint[]]>((elaborated) =>
          Infer.getConstraints().map((constraints) => [elaborated, constraints])
        )
        .run({ num: 0, constraints: [] });
      let { substitution, errors } = solve(constraints);
      expression = applyToExpr(expression, substitution);
      return [{ ...statement, expression }, errors];
    case Stmt.Is.Error:
      return [statement, []];
    default:
      return statement satisfies never;
  }
}
