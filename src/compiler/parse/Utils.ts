import { Token, tokenBounds } from "../scan/Token";
import { Expr } from "./AST/Expr";
import { Stmt } from "./AST/Stmt";

export function expressionBounds(expr: Expr): {
  to: number;
  from: number;
} {
  switch (expr.is) {
    case Expr.Is.Application:
    case Expr.Is.Binary:
      return {
        from: expressionBounds(expr.left).from,
        to: expressionBounds(expr.right).to,
      };
    case Expr.Is.Section:
      return expr.side === "left"
        ? {
            from: expressionBounds(expr.operator).from,
            to: expressionBounds(expr.expression).to,
          }
        : {
            from: expressionBounds(expr.expression).from,
            to: expressionBounds(expr.operator).to,
          };
    case Expr.Is.Grouping:
      return {
        from: expr.leftParen.from,
        to: tokenBounds(expr.rightParen).to,
      };
    case Expr.Is.List:
      return {
        from: expr.leftBracket.from,
        to: tokenBounds(expr.rightBracket).to,
      };
    case Expr.Is.Literal:
      return tokenBounds(expr.token);
    case Expr.Is.Variable:
      return tokenBounds(expr.name);
    case Expr.Is.Empty:
      throw new Error("Empty AST nodes don't have source bounds");
    default:
      return expr satisfies never;
  }
}
