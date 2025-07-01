import type { Diagnostic } from "@codemirror/lint";

import { Stmt } from "../parse/AST/Stmt";
import { Expr } from "../parse/AST/Expr";
import { expressionBounds } from "../parse/Utils";

export function collectErrors(stmts: Stmt[]): Diagnostic[] {
  return stmts.flatMap(collectStmtErrors);
}

export function collectStmtErrors(stmt: Stmt): Diagnostic[] {
  switch (stmt.is) {
    case Stmt.Is.Expression:
      return collectExprErrors(stmt.expression);
    case Stmt.Is.Error:
      let { message, from, to } = stmt;
      return [{ severity: "error", message, from, to }];
  }
}

export function collectExprErrors(expr: Expr): Diagnostic[] {
  switch (expr.is) {
    case Expr.Is.Empty:
    case Expr.Is.Variable:
    case Expr.Is.Literal:
      return [];
    case Expr.Is.Application: {
      let { left, right } = expr;
      return [...collectExprErrors(left), ...collectExprErrors(right)];
    }
    default:
      //TODO: Fix this
      return [];
  }
}
