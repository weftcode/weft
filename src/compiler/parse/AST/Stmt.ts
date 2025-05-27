import { Expr } from "./Expr";

export type Stmt<Extend extends Stmt.Extension = Stmt.Extension> =
  Stmt.Expression<Extend>;

export namespace Stmt {
  export enum Is {
    Expression = "Expression",
    Error = "Error",
  }

  export type Extension = {
    "Stmt.Expression": object;
    "Stmt.Error": object;
  } & Expr.Extension;

  export interface Expression<Extend extends Extension = Extension> {
    is: Is.Expression;
    expression: Expr<Extend>;
  }
}
