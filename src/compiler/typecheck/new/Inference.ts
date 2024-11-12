import { Expr } from "../../parse/AST/Expr";

import { Kind, Type } from "./Type";

import { TypeInf, freshInst, unify } from "./Monad";
import { TypeEnv } from "./Context";
import { Predicate } from "./TypeClass";
import { TFunc } from "./BuiltIns";

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
  env: TypeEnv,
  expr: Expr
): TypeInf<[Predicate[], Type]> {
  switch (expr.is) {
    case Expr.Is.Variable:
      let scheme = env[expr.name.lexeme];
      return freshInst(scheme).bind(({ preds, type }) =>
        TypeInf.pure([preds, type])
      );

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

    default:
      throw new Error("Incomplete");
  }
}

export function inferApp(
  env: TypeEnv,
  { left, right }: Expr & { is: Expr.Is.Application }
) {
  return inferExpr(env, left).bind(([ps, typeL]) =>
    inferExpr(env, right).bind(([qs, typeR]) =>
      TypeInf.newTVar({ is: Kind.Is.Type }).bind((typeResult) =>
        unify(TFunc(typeR, typeResult), typeL).then(
          TypeInf.pure<[Predicate[], Type]>([ps.concat(qs), typeResult])
        )
      )
    )
  );
}
