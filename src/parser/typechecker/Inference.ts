import { Expr } from "../Expr";

import {
  generalise,
  instantiate,
  makeSubstitution,
  newTypeVar,
  Substitution,
  unify,
} from "./Utilities";
import { Context, makeContext, MonoType } from "./Types";

export const W = (typEnv: Context, expr: Expr): [Substitution, MonoType] => {
  if (expr.type === Expr.Type.Literal) {
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
  }

  if (expr.type === Expr.Type.Variable) {
    const value = typEnv[expr.name.lexeme];
    if (value === undefined)
      throw new Error(`Undefined variable: ${expr.name.lexeme}`);
    return [makeSubstitution({}), instantiate(value)];
  }

  // if (expr.type === "abs") {
  //   const beta = newTypeVar();
  //   const [s1, t1] = W(
  //     makeContext({
  //       ...typEnv,
  //       [expr.x]: beta,
  //     }),
  //     expr.e
  //   );
  //   return [
  //     s1,
  //     s1({
  //       type: "ty-app",
  //       C: "->",
  //       mus: [beta, t1],
  //     }),
  //   ];
  // }

  if (expr.type === Expr.Type.Application) {
    const [s1, t1] = W(typEnv, expr.left);
    const [s2, t2] = W(s1(typEnv), expr.right);
    const beta = newTypeVar();

    const s3 = unify(s2(t1), {
      type: "ty-app",
      C: "->",
      mus: [t2, beta],
    });
    return [s3(s2(s1)), s3(beta)];
  }

  // if (expr.type === "let") {
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

  throw new Error("Unsupported Expr type");
};
