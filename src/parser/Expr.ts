import { Token, Primitive } from "./Token";

export type Expr =
  | { type: Expr.Type.Assignment; name: Token; value: Expr }
  | {
      type: Expr.Type.Binary;
      left: Expr;
      operator: Token;
      right: Expr;
      precedence: number;
    }
  | {
      type: Expr.Type.Section;
      operator: Token;
      expression: Expr;
      side: "left" | "right";
    }
  | { type: Expr.Type.Grouping; expression: Expr }
  | { type: Expr.Type.List; items: Expr[] }
  | { type: Expr.Type.Literal; value: Primitive }
  | { type: Expr.Type.Unary; operator: Token; right: Expr }
  | { type: Expr.Type.Variable; name: Token }
  | { type: Expr.Type.Application; left: Expr; right: Expr };

export namespace Expr {
  export enum Type {
    Application = "Application",
    Assignment = "Assignment",
    Binary = "Binary",
    Section = "Section",
    Grouping = "Grouping",
    List = "List",
    Literal = "Literal",
    Unary = "Unary",
    Variable = "Variable",
  }

  export function Application(left: Expr, right: Expr): Expr {
    return { type: Expr.Type.Application, left, right };
  }

  export function Assignment(name: Token, value: Expr): Expr {
    return { type: Expr.Type.Assignment, name, value };
  }

  export function Binary(
    left: Expr,
    operator: Token,
    right: Expr,
    precedence: number
  ): Expr {
    return { type: Expr.Type.Binary, left, operator, right, precedence };
  }

  export function Section(
    operator: Token,
    expression: Expr,
    side: "left" | "right"
  ) {
    return { type: Expr.Type.Section, operator, expression, side };
  }

  export function Grouping(expression: Expr): Expr {
    return { type: Expr.Type.Grouping, expression };
  }

  export function List(items: Expr[]): Expr {
    return { type: Expr.Type.List, items };
  }

  export function Literal(value: Primitive): Expr {
    return { type: Expr.Type.Literal, value };
  }

  export function Unary(operator: Token, right: Expr): Expr {
    return { type: Expr.Type.Unary, operator, right };
  }

  export function Variable(name: Token): Expr {
    return { type: Expr.Type.Variable, name };
  }
}
