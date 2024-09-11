// import { Token, Primitive } from "./Token";

export type CoreExpr = CoreVarExpr | CoreLitExpr | CoreAppExpr | CoreAbsExpr;

export interface CoreExprCommon {}

export interface CoreVarExpr extends CoreExprCommon {
  type: "Core_Var";
  x: string;
}

export interface CoreLitExpr extends CoreExprCommon {
  type: "Core_Lit";
  value: string | number | boolean;
}

export interface CoreAppExpr extends CoreExprCommon {
  type: "Core_App";
  e1: CoreExpr;
  e2: CoreExpr;
}

export interface CoreAbsExpr extends CoreExprCommon {
  type: "Core_Abs";
  x: string;
  e: CoreExpr;
}
