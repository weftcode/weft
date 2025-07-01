import { Stmt } from "../../parse/AST/Stmt";

import { TypeScheme } from "../TypeScheme";
import { inferExpr } from "./Inference_THIH";
// import { UnificationError } from "./Utilities";
import { Environment } from "../environment";
import { TypeInf } from "../Monad";
import { applyToExpr } from "../Annotations";
import { applyToPred } from "../Substitution";
import { printContext } from "../Printer";
import { reduce } from "../TypeClass";
import { TypeExt } from "../ASTExtensions";

export class TypeChecker {
  constructor(private environment: Environment) {}

  check(statement: Stmt): Stmt<TypeExt> {
    try {
      switch (statement.is) {
        case Stmt.Is.Expression:
          let expression = inferExpr(this.environment, statement.expression)
            .bind(([ps, expr]) =>
              TypeInf.getSub.bind((sub) => {
                const qs = ps.map(({ pred }) => applyToPred(sub, pred));
                console.log(printContext(qs));
                reduce(this.environment.typeClassEnv, qs);
                return TypeInf.pure(applyToExpr(expr, sub));
              })
            )
            .run();
          return { ...statement, expression };
        case Stmt.Is.Error:
          return statement;
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
