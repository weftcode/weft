import { Expr } from "./Expr";

export class AstPrinter {
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
    }
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    return `(${name} ${exprs.map((e) => this.print(e)).join(" ")})`;
  }
}
