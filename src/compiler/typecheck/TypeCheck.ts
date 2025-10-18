import { Expr } from "../parse/AST/Expr";
import { Stmt } from "../parse/AST/Stmt";

import { TypeScheme } from "./TypeScheme";
import { Environment } from "../environment";
import { Constraint } from "./Constraint";
import { infer, applyToExpr, checkLiterals } from "./Generation";
import { TypeExt } from "./ASTExtensions";
import { Infer } from "./Infer";
import { solve, SolverError } from "./Solver";
import { validateQualType } from "./CheckSignature";

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
      let litErrors: SolverError[];
      [expression, litErrors] = checkLiterals(expression);
      return [{ ...statement, expression }, [...errors, ...litErrors]];
    case Stmt.Is.Annotation:
      // TODO: Check kind etc
      let { name, typeSig } = statement;
      let type = validateQualType(typeSig);

      return [
        {
          ...statement,
          name: { ...name, type: type.type },
          type,
        },
        [],
      ];
    case Stmt.Is.Error:
      return [statement, []];
    default:
      return statement satisfies never;
  }
}
