import { Expr } from "../parse/AST/Expr";

import { Kind } from "./Type";

import { TypeInf, freshInst, unify } from "./Monad";
import {
  ClassConstraint,
  TypeInfo,
  UnificationError,
  getType,
} from "./Annotations";
import { KType, TFunc } from "./BuiltIns";
import { TokenType } from "../scan/TokenType";
import { printPred } from "./Printer";
import { applyToPred } from "./Substitution";
import { byInst } from "./TypeClass";
import { Environment, TypeClassEnv } from "./environment";

export function inferLit(
  expr: Expr.Literal
): TypeInf<[ClassConstraint[], Expr<TypeInfo>]> {
  const typeClass =
    expr.token.type === TokenType.String ? "FromString" : "FromNumber";
  return TypeInf.newTVar(KType).bind((type) => {
    const constraint = { pred: { isIn: typeClass, type } };
    return TypeInf.pure([
      [constraint],
      { ...expr, type, typeClasses: [constraint] },
    ]);
  });
}

export function inferExpr(
  env: Environment,
  expr: Expr
): TypeInf<[ClassConstraint[], Expr<TypeInfo>]> {
  switch (expr.is) {
    // Literals
    case Expr.Is.Literal:
      return inferLit(expr);

    // Variable
    case Expr.Is.Variable:
      let scheme = env.typeEnv[expr.name.lexeme].type;
      return freshInst(scheme).bind(({ preds, type }) => {
        const typeClasses = preds.map((pred) => ({ pred }));
        return TypeInf.pure([typeClasses, { ...expr, type, typeClasses }]);
      });

    // Grouping
    case Expr.Is.Grouping:
      return inferExpr(env, expr.expression);

    // Function application
    case Expr.Is.Application:
      return inferApp(env, expr);

    // Special cases of function application
    case Expr.Is.Binary:
      return inferApp(env, {
        is: Expr.Is.Application,
        left: {
          is: Expr.Is.Application,
          left: expr.operator,
          right: expr.left,
        },
        right: expr.right,
      });

    //   // We expect that the typed expression we got back is still a binary expression
    //   if (absExpr.is !== Expr.Is.Binary) {
    //     throw new Error(
    //       `Unexpected expression in section inference: ${absExpr.is}`
    //     );
    //   }

    //   return [
    //     substitution,
    //     {
    //       is: Expr.Is.Section,
    //       operator: absExpr.operator,
    //       expression: expr.side === "left" ? absExpr.right : absExpr.left,
    //       side: expr.side,
    //       ...typeInfo,
    //     },
    //   ];
    // }

    // case Expr.Is.List:
    //   // Desugar to a right-associative set of cons operators
    //   return W(
    //     typEnv,
    //     expr.items.reduceRight(
    //       (right, left) => ({
    //         is: Expr.Is.Binary,
    //         left,
    //         operator: {
    //           is: Expr.Is.Variable,
    //           name: { type: TokenType.Identifier, lexeme: ":", from: 0 },
    //         },
    //         right,
    //         precedence: 0,
    //       }),
    //       {
    //         is: Expr.Is.Variable,
    //         name: { type: TokenType.Identifier, lexeme: "[]", from: 0 },
    //       }
    //     )
    //   );

    // case Expr.Is.Error:
    // case Expr.Is.Empty:
    //   throw new Error(`Unhandled expression type: ${expr.is}`);

    default:
      throw new Error("Incomplete");
  }
}

export function inferApp(
  env: Environment,
  expr: Expr & { is: Expr.Is.Application }
) {
  let { left, right } = expr;
  return inferExpr(env, left).bind(([ps, typedL]) =>
    inferExpr(env, right).bind(([qs, typedR]) =>
      TypeInf.newTVar({ is: Kind.Is.Type }).bind((typeResult) => {
        let lType = getType(typedL);
        let rType = getType(typedR);

        if (!lType || !rType) {
          return TypeInf.pure<[ClassConstraint[], Expr<TypeInfo>]>([
            ps.concat(qs),
            { ...expr, left: typedL, right: typedR, type: null },
          ]);
        }

        return unify(lType, TFunc(rType, typeResult)).bind((result) => {
          let constraints = ps.concat(qs);

          return checkConstraints(env.typeClassEnv, constraints).then(
            TypeInf.pure<[ClassConstraint[], Expr<TypeInfo>]>([
              constraints,
              {
                ...expr,
                left: typedL,
                right: typedR,
                type: result === null ? typeResult : null,
                ...(result === null
                  ? {}
                  : {
                      typeAnnotation: new UnificationError(
                        typedR,
                        result[0],
                        result[1]
                      ),
                    }),
              },
            ])
          );
        });
      })
    )
  );
}

const checkConstraints = (ce: TypeClassEnv, cs: ClassConstraint[]) =>
  TypeInf.getSub.bind((sub) => {
    for (let c of cs) {
      console.log(printPred(c.pred));
      console.log(printPred(applyToPred(sub, c.pred)));
      byInst(ce, c.pred);
    }
    return TypeInf.pure(null);
  });
