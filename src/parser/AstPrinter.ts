import { Expr } from "./Expr";
import { Stmt } from "./Stmt";

export class AstPrinter {
  printStmts(stmts: Stmt[]) {
    return stmts.map((s) => this.printStmt(s)).join("\n");
  }

  printStmt(stmt: Stmt) {
    switch (stmt.type) {
      case Stmt.Type.Expression:
        return this.parenthesize("expression", stmt.expression);
      case Stmt.Type.Print:
        return this.parenthesize("print", stmt.expression);
      case Stmt.Type.Var:
        return this.parenthesize("var " + stmt.name.lexeme, stmt.initializer);
    }
  }

  print(expr: Expr) {
    switch (expr.type) {
      case Expr.Type.Binary:
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
      case Expr.Type.Grouping:
        return this.parenthesize("group", expr.expression);
      case Expr.Type.Literal:
        if (expr.value == null) return "nil";
        return expr.value.toString();
      case Expr.Type.Unary:
        return this.parenthesize(expr.operator.lexeme, expr.right);
      case Expr.Type.Assignment:
        return this.parenthesize("assignment " + expr.name.lexeme, expr.value);
      case Expr.Type.Variable:
        return expr.name.lexeme;
      default:
        return expr satisfies never;
    }
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    return `(${name} ${exprs.map((e) => this.print(e)).join(" ")})`;
  }
}
