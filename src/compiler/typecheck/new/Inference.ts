import { Expr } from "../../parse/Expr";

import { Kind, Type } from "./Type";

import { TypeInf, freshInst, unify } from "./Monad";
import { Context } from "./Context";
import { Predicate } from "./TypeClass";

// data Expr = Var   Id
//           | Lit   Literal
//           | Const Assump
//           | Ap    Expr Expr
//           | Let   BindGroup Expr

// type Infer e t = ClassEnv -> [Assump] -> e -> TI ([Pred], t)

// tiExpr                       :: Infer Expr Type
// tiExpr ce as (Var i)          = do sc         <- find i as
//                                    (ps :=> t) <- freshInst sc
//                                    return (ps, t)
// tiExpr ce as (Const (i:>:sc)) = do (ps :=> t) <- freshInst sc
//                                    return (ps, t)
// tiExpr ce as (Lit l)          = do (ps,t) <- tiLit l
//                                    return (ps, t)
// tiExpr ce as (Ap e f)         = do (ps,te) <- tiExpr ce as e
//                                    (qs,tf) <- tiExpr ce as f
//                                    t       <- newTVar Star
//                                    unify (tf `fn` t) te
//                                    return (ps++qs, t)
// tiExpr ce as (Let bg e)       = do (ps, as') <- tiBindGroup ce as bg
//                                    (qs, t)   <- tiExpr ce (as' ++ as) e
//                                    return (ps ++ qs, t)

export function inferExpr(
  env: Context,
  expr: Expr
): TypeInf<[Predicate[], Type]> {
  switch (expr.type) {
    case Expr.Type.Variable:
      let scheme = env[expr.name.lexeme];
      return freshInst(scheme).bind(({ preds, type }) =>
        TypeInf.pure([preds, type])
      );

    // Grouping
    case Expr.Type.Grouping:
      return inferExpr(env, expr.expression);

    // Function application
    case Expr.Type.Application:
      return inferApp(env, expr);

    // Special cases of function application
    case Expr.Type.Binary:
      return inferApp(env, {
        type: Expr.Type.Application,
        left: {
          type: Expr.Type.Application,
          left: { type: Expr.Type.Variable, name: expr.operator },
          right: expr.left,
        },
        right: expr.right,
      });

    default:
      throw new Error("Incomplete");
  }
}

export function inferApp(
  env: Context,
  { left, right }: Expr & { type: Expr.Type.Application }
) {
  return inferExpr(env, left).bind(([ps, typeL]) =>
    inferExpr(env, right).bind(([qs, typeR]) =>
      TypeInf.newTVar({ is: Kind.Is.Type }).bind((typeResult) =>
        unify(fnType(typeR, typeResult), typeL).then(
          TypeInf.pure<[Predicate[], Type]>([ps.concat(qs), typeResult])
        )
      )
    )
  );
}
