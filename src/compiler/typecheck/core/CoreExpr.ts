/**
 * Expression definitions for a "core" language. Right now, it contains literal
 * values, variables and lambda calculus function application and abstraction.
 */

import { Token } from "../../scan/Token";
import { Expr } from "../../parse/Expr";

export type CoreExpr =
  | CoreExpr.Var
  | CoreExpr.Lit
  | CoreExpr.App
  | CoreExpr.Abs;

export namespace CoreExpr {
  export enum Type {
    Var = "CORE_EXPR_VAR",
    Lit = "CORE_EXPR_LIT",
    App = "CORE_EXPR_APP",
    Abs = "CORE_EXPR_ABS",
  }

  export interface Common {
    source: Expr | Token | null;
  }

  export interface Var extends Common {
    type: Type.Var;
    x: string;
  }

  export interface Lit extends Common {
    type: Type.Lit;
    value: string | number | boolean;
  }

  export interface App extends Common {
    type: Type.App;
    e1: CoreExpr;
    e2: CoreExpr;
  }

  export interface Abs extends Common {
    type: Type.Abs;
    x: string;
    e: CoreExpr;
  }
}
