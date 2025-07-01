import { Expr } from "../../parse/AST/Expr";

import {
  instantiate,
  makeSubstitution,
  newLiteral,
  newTypeVar,
  Substitution,
  unify,
} from "./Utilities";
import { Context, makeContext, MonoType } from "./Types";
import { TokenType } from "../../scan/TokenType";
import {
  TypeAnnotation,
  MissingTypeWarning,
  UnificationError,
  ApplicationError,
  TypeInfo,
  getType,
  NodeTypeInfo,
} from "./Annotations";

export const W = (
  typEnv: Context,
  expr: Expr
): [Substitution, Expr<TypeInfo>] => {
  switch (expr.is) {
    case Expr.Is.Variable: {
      const value = typEnv[expr.name.lexeme];
      let type: MonoType;
      if (value === undefined) {
        // TODO: attach source position to this
        type = newTypeVar();
        return [
          makeSubstitution({}),
          {
            ...expr,
            type,
            typeAnnotation: new MissingTypeWarning(expr, type),
          },
        ];
      }
      type = instantiate(value);
      return [makeSubstitution({}), { ...expr, type }];
    }

    case Expr.Is.Literal:
      const litType =
        expr.token.type === TokenType.Number ? "number" : "string";
      return [makeSubstitution({}), { ...expr, type: newLiteral(litType) }];

    case Expr.Is.Grouping: {
      const [sub, expression] = W(typEnv, expr.expression);
      return [sub, { ...expr, expression }];
    }

    case Expr.Is.Application: {
      const [substitution, typeInfo, left, right] = InferTypeApp(
        typEnv,
        expr.left,
        expr.right
      );
      return [substitution, { ...expr, left, right, ...typeInfo }];
    }

    case Expr.Is.Binary: {
      const [substitution, typeInfo, opApp, right] = InferTypeApp(
        typEnv,
        {
          is: Expr.Is.Application,
          left: expr.operator,
          right: expr.left,
        },
        expr.right
      );

      if (opApp.is !== Expr.Is.Application) {
        throw new Error("Error with binary op inference: No application");
      }

      let { left: operator, right: left } = opApp;

      if (operator.is !== Expr.Is.Variable) {
        throw new Error("Error with binary op inference: No variable operator");
      }

      return [substitution, { ...expr, left, operator, right, ...typeInfo }];
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
      const [substitution, typeInfo, absExpr] = InferTypeAbs(typEnv, lexeme, {
        is: Expr.Is.Binary,
        left,
        operator: expr.operator,
        right,
        precedence: 0,
      });

      // We expect that the typed expression we got back is still a binary expression
      if (absExpr.is !== Expr.Is.Binary) {
        throw new Error(
          `Unexpected expression in section inference: ${absExpr.is}`
        );
      }

      return [
        substitution,
        {
          is: Expr.Is.Section,
          operator: absExpr.operator,
          expression: expr.side === "left" ? absExpr.right : absExpr.left,
          side: expr.side,
          ...typeInfo,
        },
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
): [Substitution, NodeTypeInfo, Expr<TypeInfo>] {
  const beta = newTypeVar();
  const [s1, e1] = W(
    makeContext({
      ...typeEnv,
      [x]: beta,
    }),
    expr
  );

  let t1 = getType(e1);
  let type = t1 && s1({ type: "ty-app", C: "->", mus: [beta, t1] });

  return [s1, { type }, e1];
}

function InferTypeApp(
  typeEnv: Context,
  left0: Expr,
  right0: Expr
): [Substitution, NodeTypeInfo, Expr<TypeInfo>, Expr<TypeInfo>] {
  const [sLeft, left] = W(typeEnv, left0);
  const [sRight, right] = W(sLeft(typeEnv), right0);
  const beta = newTypeVar();

  // const a3 = a1.concat(a2);

  let tLeft = getType(left);
  let tRight = getType(right);

  if (tLeft && tRight) {
    const sub = unify(sRight(tLeft), {
      type: "ty-app",
      C: "->",
      mus: [tRight, beta],
    });

    if (sub) {
      return [sub(sRight(sLeft)), { type: sub(beta) }, left, right];
    } else {
      let fType = sRight(tLeft);

      let typeAnnotation: TypeAnnotation;

      if (fType.type === "ty-app" && fType.C === "->") {
        typeAnnotation = new UnificationError(right0, fType.mus[0], tRight);
      } else {
        typeAnnotation = new ApplicationError(right0);
      }

      return [sRight(sLeft), { type: null, typeAnnotation }, left, right];
    }
  }

  return [sLeft, { type: null }, left, right];
}
