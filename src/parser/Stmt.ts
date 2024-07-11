import { Token } from "./Token";
import { Expr } from "./Expr";

export type Stmt = {
  type: Stmt.Type.Expression;
  expression: Expr;
};
// | { type: Stmt.Type.Var; name: Token; initializer: Expr };

export namespace Stmt {
  export enum Type {
    Expression,
    // Var, // Bindings, for future use
  }

  export function Expression(expression: Expr): Stmt {
    return { type: Stmt.Type.Expression, expression };
  }

  // export function Print(expression: Expr): Stmt {
  //   return { type: Stmt.Type.Print, expression };
  // }

  // export function Var(name: Token, initializer: Expr): Stmt {
  //   return { type: Stmt.Type.Var, name, initializer };
  // }
}
