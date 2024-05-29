import { Token, LoxType } from "./Token";

export type Expr =
  | {
      type: Expr.Type.Binary;
      left: Expr;
      operator: Token;
      right: Expr;
    }
  | { type: Expr.Type.Grouping; expression: Expr }
  | { type: Expr.Type.Literal; value: LoxType }
  | { type: Expr.Type.Unary; operator: Token; right: Expr };

export namespace Expr {
  export enum Type {
    Binary,
    Grouping,
    Literal,
    Unary,
  }

  export function Binary(left: Expr, operator: Token, right: Expr): Expr {
    return { type: Expr.Type.Binary, left, operator, right };
  }

  export function Grouping(expression: Expr): Expr {
    return { type: Expr.Type.Grouping, expression };
  }

  export function Literal(value: LoxType): Expr {
    return { type: Expr.Type.Literal, value };
  }

  export function Unary(operator: Token, right: Expr): Expr {
    return { type: Expr.Type.Unary, operator, right };
  }
}
