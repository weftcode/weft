import { Stmt } from "../parse/AST/Stmt";
import { ErrorReporter } from "../parse/Reporter";

import { TypeScheme } from "./TypeScheme";
import { inferExpr } from "./Inference";
// import { UnificationError } from "./Utilities";
import { Environment } from "./environment";
import { TypeInf } from "./Monad";
import { applyToExpr } from "./Annotations";
import { applyToPred } from "./Substitution";
import { printContext } from "./Printer";
import { reduce } from "./TypeClass";

export class TypeChecker {
  constructor(
    private readonly reporter: ErrorReporter,
    private environment: Environment
  ) {}

  check(statement: Stmt) {
    try {
      switch (statement.is) {
        case Stmt.Is.Expression:
          let expression = inferExpr(
            this.environment.typeEnv,
            statement.expression
          )
            .bind(([ps, expr]) =>
              TypeInf.getSub.bind((sub) => {
                const qs = ps.map((p) => applyToPred(sub, p));
                console.log(printContext(qs));
                reduce(this.environment.typeClassEnv, qs);
                return TypeInf.pure(applyToExpr(expr, sub));
              })
            )
            .run();
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
