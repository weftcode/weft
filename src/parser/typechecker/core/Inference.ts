/**
 * Version of the inference function (algorithm w) optimized for a core (lambda calculus) representation.
 */

import { CoreExpr } from "./CoreExpr";

import {
  generalise,
  instantiate,
  makeSubstitution,
  newTypeVar,
  Substitution,
  unify,
} from "../Utilities";
import { Context, makeContext, MonoType } from "../Types";

export const W = (
  typEnv: Context,
  expr: CoreExpr
): [Substitution, MonoType] => {
  try {
    switch (expr.type) {
      case CoreExpr.Type.Var:
        const value = typEnv[expr.x];
        if (value === undefined)
          // TODO: attach source position to this
          throw new Error(`Undefined variable: ${expr.x}`);
        return [
          makeSubstitution({}),
          instantiate({ ...value, source: expr.source }),
        ];
      case CoreExpr.Type.Lit:
        switch (typeof expr.value) {
          case "string":
            return [
              makeSubstitution({}),
              {
                type: "ty-app",
                C: "Pattern",
                mus: [newTypeVar()],
                source: expr.source,
              },
            ];
          case "number":
            return [
              makeSubstitution({}),
              {
                type: "ty-app",
                C: "Pattern",
                mus: [{ type: "ty-app", C: "Number", mus: [], source: null }],
                source: expr.source,
              },
            ];
          case "boolean":
            return [
              makeSubstitution({}),
              { type: "ty-app", C: "Boolean", mus: [], source: expr.source },
            ];
        }
      case CoreExpr.Type.Abs: {
        const beta = newTypeVar();
        const [s1, t1] = W(
          makeContext({
            ...typEnv,
            [expr.x]: beta,
          }),
          expr.e
        );
        return [
          s1,
          s1({
            type: "ty-app",
            C: "->",
            mus: [beta, t1],
            source: expr.source,
          }),
        ];
      }
      case CoreExpr.Type.App: {
        const [s1, t1] = W(typEnv, expr.e1);
        const [s2, t2] = W(s1(typEnv), expr.e2);
        const beta = newTypeVar();

        const s3 = unify(s2(t1), {
          type: "ty-app",
          C: "->",
          mus: [t2, beta],
          source: expr.source,
        });
        return [s3(s2(s1)), s3(beta)];
      }
      // case "Core_Let": {
      //   const [s1, t1] = W(typEnv, expr.e1);
      //   const [s2, t2] = W(
      //     makeContext({
      //       ...s1(typEnv),
      //       [expr.x]: generalise(typEnv, t1),
      //     }),
      //     expr.e2
      //   );
      //   return [s2(s1), t2];
      // }
      default:
        return expr satisfies never;
    }
  } catch (error) {
    console.log("Type Error:");
    console.log(error.message);
    throw error;
  }
};
