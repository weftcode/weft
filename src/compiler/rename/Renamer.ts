import { tokenBounds } from "../scan/Token";
import { Expr } from "../parse/AST/Expr";
import { Stmt } from "../parse/AST/Stmt";
import { ErrorReporter } from "../parse/Reporter";
import { Bindings } from "../parse/API";

export function renamer(
  stmts: Stmt[],
  context: Bindings,
  reporter: ErrorReporter
) {
  for (let stmt of stmts) {
    switch (stmt.is) {
      case Stmt.Is.Expression:
        expressionRenamer(stmt.expression, context, reporter);
        break;
      default:
        stmt.is satisfies never;
    }
  }
}

export function expressionRenamer(
  expr: Expr,
  context: Bindings,
  reporter: ErrorReporter
): void {
  switch (expr.is) {
    case Expr.Is.Literal:
    case Expr.Is.Empty:
      return;

    // The main case
    case Expr.Is.Variable:
      if (!(expr.name.lexeme in context)) {
        let { from, to } = tokenBounds(expr.name);
        reporter.error(from, to, `Variable "${expr.name.lexeme}" is undefined`);
      }
      return;

    case Expr.Is.Application:
      expressionRenamer(expr.left, context, reporter);
      expressionRenamer(expr.right, context, reporter);
      return;

    case Expr.Is.Binary:
      expressionRenamer(expr.left, context, reporter);
      expressionRenamer(expr.operator, context, reporter);
      expressionRenamer(expr.right, context, reporter);
      return;

    case Expr.Is.Section:
      expressionRenamer(expr.operator, context, reporter);
      expressionRenamer(expr.expression, context, reporter);
      return;

    case Expr.Is.Grouping:
      expressionRenamer(expr.expression, context, reporter);
      return;

    case Expr.Is.List:
      expr.items.forEach((item) => {
        expressionRenamer(item, context, reporter);
      });
      return;

    default:
      return expr satisfies never;
  }
}
