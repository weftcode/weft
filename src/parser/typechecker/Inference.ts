import { Token } from "../Token";
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
import { TokenType } from "../TokenType";

export type TypeAnnotation =
  | { type: "Type"; expr: Expr; inferredType: MonoType }
  | { type: "Warning"; expr: Expr; message: string };

export const W = (
  typEnv: Context,
  expr: Expr
): [Substitution, MonoType, TypeAnnotation[]] => {
  try {
    switch (expr.type) {
      case Expr.Type.Variable: {
        const value = typEnv[expr.name.lexeme];
        if (value === undefined) {
          // TODO: attach source position to this
          //throw new Error(`Undefined variable: ${expr.name.lexeme}`);
          let newType = newTypeVar();
          return [
            makeSubstitution({}),
            newType,
            [
              { type: "Type", expr, inferredType: newType },
              {
                type: "Warning",
                expr,
                message: `Missing type annotation for ${expr.name.lexeme}`,
              },
            ],
          ];
        }
        const type = instantiate(value);
        return [
          makeSubstitution({}),
          type,
          [{ type: "Type", expr, inferredType: type }],
        ];
      }
      case Expr.Type.Literal:
        switch (typeof expr.value) {
          case "string": {
            const type: MonoType = {
              type: "ty-app",
              C: "Pattern",
              mus: [newTypeVar()],
            };
            return [
              makeSubstitution({}),
              type,
              [{ type: "Type", expr, inferredType: type }],
            ];
          }
          case "number": {
            const type: MonoType = {
              type: "ty-app",
              C: "Pattern",
              mus: [{ type: "ty-app", C: "Number", mus: [] }],
            };
            return [
              makeSubstitution({}),
              type,
              [{ type: "Type", expr, inferredType: type }],
            ];
          }
          case "boolean": {
            const type: MonoType = { type: "ty-app", C: "Boolean", mus: [] };
            return [
              makeSubstitution({}),
              type,
              [{ type: "Type", expr, inferredType: type }],
            ];
          }
        }
      case Expr.Type.Grouping:
        return W(typEnv, expr.expression);

      case Expr.Type.Application: {
        const [substitution, type, annotations] = InferTypeApp(
          typEnv,
          expr.left,
          expr.right
        );
        return [
          substitution,
          type,
          annotations.concat([{ type: "Type", expr, inferredType: type }]),
        ];
      }

      case Expr.Type.Binary: {
        const [substitution, type, annotations] = InferTypeApp(
          typEnv,
          Expr.Application(Expr.Variable(expr.operator), expr.left),
          expr.right
        );
        return [
          substitution,
          type,
          annotations.concat([{ type: "Type", expr, inferredType: type }]),
        ];
      }

      case Expr.Type.Section: {
        // TODO: This is likely, but not necessarily, a unique name. A better
        //       implementation would use a separate renaming step like GHC.
        const x = (Math.random() + 1).toString(36).substring(7);
        const xExp = Expr.Variable(new Token(TokenType.Identifier, x, null, 0));

        // A section is just a binary operation wrapped in a function abstraction. One of the
        // sides of the operator is the variable from the abstraction
        let left = expr.side === "left" ? xExp : expr.expression;
        let right = expr.side === "right" ? xExp : expr.expression;

        // TODO: Does it matter that this binary expression has a made-up precedence?
        const [substitution, type, annotations] = InferTypeAbs(
          typEnv,
          x,
          Expr.Binary(left, expr.operator, right, 0)
        );
        return [
          substitution,
          type,
          annotations.concat([{ type: "Type", expr, inferredType: type }]),
        ];
      }

      case Expr.Type.List:
        // Desugar to a right-associative set of cons operators
        return W(
          typEnv,
          expr.items.reduceRight(
            (prev, item) =>
              Expr.Binary(
                item,
                new Token(TokenType.Identifier, ":", null, 0),
                prev,
                0
              ),
            Expr.Variable(new Token(TokenType.Identifier, "[]", null, 0))
          )
        );

      case Expr.Type.Assignment:
      case Expr.Type.Unary:
      case Expr.Type.Empty:
        throw new Error(`Unhandled expression type: ${expr.type}`);

      default:
        return expr satisfies never;
    }
  } catch (error) {
    console.log("Type Error:");
    console.log(error.message);
    throw error;
  }
};

function InferTypeAbs(
  typeEnv: Context,
  x: string,
  expr: Expr
): [Substitution, MonoType, TypeAnnotation[]] {
  const beta = newTypeVar();
  const [s1, t1, a1] = W(
    makeContext({
      ...typeEnv,
      [x]: beta,
    }),
    expr
  );
  return [
    s1,
    s1({
      type: "ty-app",
      C: "->",
      mus: [beta, t1],
    }),
    a1,
  ];
}

function InferTypeApp(
  typeEnv: Context,
  expr1: Expr,
  expr2: Expr
): [Substitution, MonoType, TypeAnnotation[]] {
  const [s1, t1, a1] = W(typeEnv, expr1);
  const [s2, t2, a2] = W(s1(typeEnv), expr2);
  const beta = newTypeVar();

  const s3 = unify(s2(t1), {
    type: "ty-app",
    C: "->",
    mus: [t2, beta],
  });

  const a3 = a1
    .concat(a2)
    .map(
      (annotation): TypeAnnotation =>
        annotation.type === "Type"
          ? { ...annotation, inferredType: s3(annotation.inferredType) }
          : annotation
    );

  return [s3(s2(s1)), s3(beta), a3];
}

// TODO: Implement Let
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
