import { CoreExpr } from "./core/CoreExpr";

import {
  generalise,
  instantiate,
  makeSubstitution,
  newTypeVar,
  Substitution,
  unify,
} from "./Utilities";
import { Context, makeContext, MonoType } from "./Types";

export const W = (
  typEnv: Context,
  expr: CoreExpr
): [Substitution, MonoType] => {
  try {
    switch (expr.type) {
      case "Core_Var":
        const value = typEnv[expr.x];
        if (value === undefined)
          throw new Error(`Undefined variable: ${expr.x}`);
        return [makeSubstitution({}), instantiate(value)];
      case "Core_Lit":
        switch (typeof expr.value) {
          case "string":
            return [
              makeSubstitution({}),
              { type: "ty-app", C: "Pattern", mus: [newTypeVar()] },
            ];
          case "number":
            return [
              makeSubstitution({}),
              {
                type: "ty-app",
                C: "Pattern",
                mus: [{ type: "ty-app", C: "Number", mus: [] }],
              },
            ];
          case "boolean":
            return [
              makeSubstitution({}),
              { type: "ty-app", C: "Boolean", mus: [] },
            ];
        }
      case "Core_Abs": {
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
          }),
        ];
      }
      case "Core_App": {
        const [s1, t1] = W(typEnv, expr.e1);
        const [s2, t2] = W(s1(typEnv), expr.e2);
        const beta = newTypeVar();

        const s3 = unify(s2(t1), {
          type: "ty-app",
          C: "->",
          mus: [t2, beta],
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
    console.log(JSON.stringify(expr, undefined, 2));
    throw error;
  }
};
