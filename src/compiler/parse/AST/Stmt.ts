import { TypeScheme } from "../../typecheck/TypeScheme";
import { Expr } from "./Expr";
import { TypeNode } from "./TypeNode";

export type Stmt<Extend extends Stmt.Extension = Stmt.Extension> =
  | Stmt.Expression<Extend>
  | Stmt.Error<Extend>;

export namespace Stmt {
  export enum Is {
    Annotation = "Type Annotation",
    Binding = "Binding",
    Expression = "Expression",
    Error = "Error",
  }

  export type Extension = {
    "Stmt.Annotation": object;
    "Stmt.Binding": object;
    "Stmt.Expression": object;
    "Stmt.Error": object;
  } & Expr.Extension;

  export type Annotation<Extend extends Extension = Extension> = {
    is: Is.Annotation;
    name: Expr.Variable<Extend>;
    type: TypeNode.Qual;
  };

  export type Binding<Extend extends Extension = Extension> = {
    is: Is.Binding;
    pattern: Expr.Variable<Extend>; // Just plain patterns for now
    expression: Expr<Extend>;
  };

  export type Expression<Extend extends Extension = Extension> = {
    is: Is.Expression;
    expression: Expr<Extend>;
  } & Extend["Stmt.Expression"];

  export type Error<Extend extends Extension = Extension> = {
    is: Is.Error;
    message: string;
    from: number;
    to: number;
  } & Extend["Stmt.Error"];
}
