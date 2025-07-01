import { Type } from "./Type";

export type Constraint = Constraint.Equality;

export namespace Constraint {
  export enum Is {
    Equality = "Equality",
  }

  export interface Equality {
    is: Is.Equality;
    left: Type;
    right: Type;
  }
}
