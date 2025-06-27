import { Token } from "../../scan/Token";
import { Expr } from "./Expr";

export type Stmt<Extend extends Stmt.Extension = Stmt.Extension> =
  | Stmt.Expression<Extend>
  | Stmt.Binding<Extend>;

export namespace Stmt {
  export enum Is {
    Expression,
    Binding,
  }

  export type Extension = {
    "Stmt.Expression": object;
  } & Expr.Extension;

  export interface Expression<Extend extends Extension = Extension> {
    is: Is.Expression;
    expression: Expr<Extend>;
  }

  export interface Binding<Extend extends Extension = Extension> {
    is: Stmt.Is.Binding;
    name: Token;
    args: Token[];
    initializer: Token;
  }
}
