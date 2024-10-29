import { Expr } from "./Expr";

export type Stmt = Stmt.Expression;

export namespace Stmt {
  export enum Is {
    Expression,
  }

  export interface Expression {
    is: Stmt.Is.Expression;
    expression: Expr;
  }
}
