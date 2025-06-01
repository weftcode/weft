import { Expr } from "./Expr";

export type Stmt<Extend extends Stmt.Extension = Stmt.Extension> =
  | Stmt.Expression<Extend>
  | Stmt.Error<Extend>;

export namespace Stmt {
  export enum Is {
    Expression = "Expression",
    Error = "Error",
  }

  export type Extension = {
    "Stmt.Expression": object;
    "Stmt.Error": object;
  } & Expr.Extension;

  export type Expression<Extend extends Extension = Extension> = {
    is: Is.Expression;
    expression: Expr<Extend>;
  } & Extend["Stmt.Expression"];

  export type Error<Extend extends Extension = Extension> = {
    is: Is.Error;
    message: string;
  } & Extend["Stmt.Error"];
}
