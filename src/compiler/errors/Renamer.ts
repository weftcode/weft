import type { Diagnostic } from "@codemirror/lint";

import { Stmt } from "../parse/AST/Stmt";
import { Expr } from "../parse/AST/Expr";
import { RenamerExt } from "../rename/ASTExtensions";
import { tokenBounds } from "../scan/Token";

export function collectRenameErrors(stmts: Stmt<RenamerExt>[]): Diagnostic[] {
  return stmts.flatMap(collectRenameStmtErrors);
}

function collectRenameStmtErrors(stmt: Stmt<RenamerExt>): Diagnostic[] {
  switch (stmt.is) {
    case Stmt.Is.Expression:
      return collectRenameExprErrors(stmt.expression);
    default:
      return [];
  }
}

function collectRenameExprErrors(expr: Expr<RenamerExt>): Diagnostic[] {
  switch (expr.is) {
    case Expr.Is.Variable:
      if (expr.missing) {
        let { from, to } = tokenBounds(expr.name);
        return [
          {
            severity: "error",
            from,
            to,
            message: `Identifier \`${expr.name.lexeme}\` isn't defined`,
          },
        ];
      }
    case Expr.Is.Literal:
    case Expr.Is.Empty:
    case Expr.Is.Error:
      return [];

    case Expr.Is.Application:
      return [
        ...collectRenameExprErrors(expr.left),
        ...collectRenameExprErrors(expr.right),
      ];

    case Expr.Is.Grouping:
      return collectRenameExprErrors(expr.expression);

    case Expr.Is.Binary:
      return [
        ...collectRenameExprErrors(expr.left),
        ...collectRenameExprErrors(expr.operator),
        ...collectRenameExprErrors(expr.right),
      ];

    case Expr.Is.Section:
      return [
        ...collectRenameExprErrors(expr.operator),
        ...collectRenameExprErrors(expr.expression),
      ];

    case Expr.Is.List:
      return expr.items.flatMap(collectRenameExprErrors);

    default:
      return expr satisfies never;
  }
}
