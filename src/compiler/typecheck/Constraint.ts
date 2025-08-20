import { Expr } from "../parse/AST/Expr";
import { Type } from "./Type";

export type Constraint = Constraint.Equality | Constraint.Class;

export namespace Constraint {
  export enum Is {
    Equality = "Equality",
    Class = "Class",
  }

  export interface Equality {
    is: Is.Equality;
    left: Type;
    right: Type;
    source: Expr;
  }

  export interface Class {
    is: Is.Class;
    type: Type;
    isIn: string;
    source: Expr;
  }
}
