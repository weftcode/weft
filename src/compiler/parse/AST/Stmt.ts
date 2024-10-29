import { Expr } from "./Expr";

export type Stmt<Extend extends Stmt.Extension = Stmt.Extension> =
  Stmt.Expression<Extend>;

export namespace Stmt {
  export enum Is {
    Expression,
  }

  export type Extension = {
    "Stmt.Expression": object;
  } & Expr.Extension;

  export interface Expression<Extend extends Extension = Extension> {
    is: Is.Expression;
    expression: Expr<Extend>;
  }
}
