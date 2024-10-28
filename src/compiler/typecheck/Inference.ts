import { Token } from "../scan/Token";
import { Expr } from "../parse/Expr";

import {
  generalise,
  instantiate,
  makeSubstitution,
  newTypeVar,
  Substitution,
  unify,
} from "./Utilities";
import { Context, makeContext, MonoType } from "./Types";
import { TokenType } from "../scan/TokenType";
import {
  TypeAnnotation,
  TypeInfo,
  MissingTypeWarning,
  UnificationError,
  ApplicationError,
} from "./Annotations";

export const W = (
  typEnv: Context,
  expr: Expr
): [Substitution, MonoType | null, TypeAnnotation[]] => {
  switch (expr.is) {
    case Expr.Is.Variable: {
      const value = typEnv[expr.name.lexeme];
      if (value === undefined) {
        // TODO: attach source position to this
        //throw new Error(`Undefined variable: ${expr.name.lexeme}`);
        let newType = newTypeVar();
        return [
          makeSubstitution({}),
          newType,
          [new MissingTypeWarning(expr, newType)],
        ];
      }
      const type = instantiate(value);
      return [makeSubstitution({}), type, [new TypeInfo(expr, type)]];
    }

    case Expr.Is.Literal:
      const type: MonoType = {
        type: "ty-lit",
        litType: expr.token.type === TokenType.Number ? "number" : "string",
      };
      return [makeSubstitution({}), type, [new TypeInfo(expr, type)]];

    case Expr.Is.Grouping:
      return W(typEnv, expr.expression);

    case Expr.Is.Application: {
      const [substitution, type, annotations] = InferTypeApp(
        typEnv,
        expr.left,
        expr.right
      );
      return [
        substitution,
        type,
        annotations.concat([new TypeInfo(expr, type)]),
      ];
    }

    case Expr.Is.Binary: {
      const [substitution, type, annotations] = InferTypeApp(
        typEnv,
        {
          is: Expr.Is.Application,
          left: expr.operator,
          right: expr.left,
        },
        expr.right
      );

      return [
        substitution,
        type,
        annotations.concat([new TypeInfo(expr, type)]),
      ];
    }

    case Expr.Is.Section: {
      // TODO: This is likely, but not necessarily, a unique name. A better
      //       implementation would use a separate renaming step like GHC.
      const lexeme = (Math.random() + 1).toString(36).substring(7);
      const xExp: Expr = {
        is: Expr.Is.Variable,
        name: { type: TokenType.Identifier, lexeme, from: 0 },
      };

      // A section is just a binary operation wrapped in a function abstraction. One of the
      // sides of the operator is the variable from the abstraction
      let left = expr.side === "left" ? xExp : expr.expression;
      let right = expr.side === "right" ? xExp : expr.expression;

      // TODO: Does it matter that this binary expression has a made-up precedence?
      const [substitution, type, annotations] = InferTypeAbs(typEnv, lexeme, {
        is: Expr.Is.Binary,
        left,
        operator: expr.operator,
        right,
        precedence: 0,
      });
      return [
        substitution,
        type,
        annotations.concat([new TypeInfo(expr, type)]),
      ];
    }

    case Expr.Is.List:
      // Desugar to a right-associative set of cons operators
      return W(
        typEnv,
        expr.items.reduceRight(
          (right, left) => ({
            is: Expr.Is.Binary,
            left,
            operator: {
              is: Expr.Is.Variable,
              name: { type: TokenType.Identifier, lexeme: ":", from: 0 },
            },
            right,
            precedence: 0,
          }),
          {
            is: Expr.Is.Variable,
            name: { type: TokenType.Identifier, lexeme: "[]", from: 0 },
          }
        )
      );

    case Expr.Is.Empty:
      throw new Error(`Unhandled expression type: ${expr.is}`);

    default:
      return expr satisfies never;
  }
};

function InferTypeAbs(
  typeEnv: Context,
  x: string,
  expr: Expr
): [Substitution, MonoType | null, TypeAnnotation[]] {
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
    t1
      ? s1({
          type: "ty-app",
          C: "->",
          mus: [beta, t1],
        })
      : null,
    a1,
  ];
}

function InferTypeApp(
  typeEnv: Context,
  expr1: Expr,
  expr2: Expr
): [Substitution, MonoType | null, TypeAnnotation[]] {
  const [s1, t1, a1] = W(typeEnv, expr1);
  const [s2, t2, a2] = W(s1(typeEnv), expr2);
  const beta = newTypeVar();

  const a3 = a1.concat(a2);

  if (t1 && t2) {
    const s3 = unify(s2(t1), {
      type: "ty-app",
      C: "->",
      mus: [t2, beta],
    });

    if (s3) {
      a3.forEach((annotation) => {
        annotation.apply(s3);
      });

      return [s3(s2(s1)), s3(beta), a3];
    } else {
      let fType = s2(t1);

      if (fType.type === "ty-app" && fType.C === "->") {
        a3.push(new UnificationError(expr2, fType.mus[0], t2));
      } else {
        a3.push(new ApplicationError(expr2));
      }

      return [s2(s1), null, a3];
    }
  }

  return [s1, null, a3];
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
