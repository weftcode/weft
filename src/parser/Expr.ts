import { Token, LoxType } from "./Token";

export type Expr =
  | { type: Expr.Type.Assignment; name: Token; value: Expr }
  | {
      type: Expr.Type.Binary;
      left: Expr;
      operator: Token;
      right: Expr;
    }
  | { type: Expr.Type.Grouping; expression: Expr }
  | { type: Expr.Type.Literal; value: LoxType }
  | { type: Expr.Type.Unary; operator: Token; right: Expr }
  | { type: Expr.Type.Variable; name: Token };

export namespace Expr {
  export enum Type {
    Assignment,
    Binary,
    Grouping,
    Literal,
    Unary,
    Variable,
  }

  export function Assignment(name: Token, value: Expr): Expr {
    return { type: Expr.Type.Assignment, name, value };
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

  export function Variable(name: Token): Expr {
    return { type: Expr.Type.Variable, name };
  }
}
