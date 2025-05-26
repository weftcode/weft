import { Expr } from "../parse/AST/Expr";
import { Stmt } from "../parse/AST/Stmt";
import { TypeEnv } from "../environment";
import { RenamerExt } from "./ASTExtensions";

export function renameStmt(stmt: Stmt, context: TypeEnv): Stmt<RenamerExt> {
  switch (stmt.is) {
    case Stmt.Is.Expression:
      return {
        ...stmt,
        expression: renameExpr(stmt.expression, context),
      };
    default:
      return stmt.is satisfies never;
  }
}

export function renameExpr(expr: Expr, context: TypeEnv): Expr<RenamerExt> {
  switch (expr.is) {
    case Expr.Is.Literal:
    case Expr.Is.Empty:
      return expr;

    // The main case
    case Expr.Is.Variable:
      return expr.name.lexeme in context ? expr : { ...expr, missing: true };

    case Expr.Is.Application:
      return {
        ...expr,
        left: renameExpr(expr.left, context),
        right: renameExpr(expr.right, context),
      };

    case Expr.Is.Binary:
      return {
        ...expr,
        left: renameExpr(expr.left, context),
        operator: renameExpr(expr.operator, context) as Expr.Variable,
        right: renameExpr(expr.right, context),
      };

    case Expr.Is.Section: {
      const operator = renameExpr(expr.operator, context) as Expr.Variable;
      const expression = renameExpr(expr.expression, context);
      return { ...expr, operator, expression };
    }

    case Expr.Is.Grouping:
      return {
        ...expr,
        expression: renameExpr(expr.expression, context),
      };

    case Expr.Is.List:
      return {
        ...expr,
        items: expr.items.map((item) => renameExpr(item, context)),
      };

    default:
      return expr satisfies never;
  }
}
