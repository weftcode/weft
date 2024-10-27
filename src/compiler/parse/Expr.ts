import { Token, tokenBounds } from "../scan/Token";
import { TokenType } from "../scan/TokenType";

export type Expr =
  | Expr.Application
  | Expr.Binary
  | Expr.Section
  | Expr.Grouping
  | Expr.List
  | Expr.Literal
  | Expr.Variable
  | Expr.Empty;

export namespace Expr {
  export enum Is {
    Application = "Application",
    Binary = "Binary",
    Section = "Section",
    Grouping = "Grouping",
    List = "List",
    Literal = "Literal",
    Variable = "Variable",
    Empty = "Empty",
  }

  export interface Empty {
    is: Expr.Is.Empty;
  }

  export interface Binary {
    is: Expr.Is.Binary;
    left: Expr;
    operator: Token;
    right: Expr;
    precedence: number;
  }
  export interface Section {
    is: Expr.Is.Section;
    operator: Token;
    expression: Expr;
    side: "left" | "right";
  }
  export interface Grouping {
    is: Expr.Is.Grouping;
    leftParen: Token;
    expression: Expr;
    rightParen: Token;
  }
  export interface List {
    is: Expr.Is.List;
    items: Expr[];
  }
  export interface Literal {
    is: Expr.Is.Literal;
    token: Token & { type: TokenType.Number | TokenType.String };
  }
  export interface Variable {
    is: Expr.Is.Variable;
    name: Token;
  }
  export interface Application {
    is: Expr.Is.Application;
    left: Expr;
    right: Expr;
  }
}

export function expressionBounds(expr: Expr): { to: number; from: number } {
  switch (expr.is) {
    case Expr.Is.Application:
    case Expr.Is.Binary:
      return {
        from: expressionBounds(expr.left).from,
        to: expressionBounds(expr.right).to,
      };
    case Expr.Is.Section:
      return expr.side === "left"
        ? { from: expr.operator.from, to: expressionBounds(expr.expression).to }
        : {
            from: expressionBounds(expr.expression).from,
            to: tokenBounds(expr.operator).to,
          };
    case Expr.Is.Grouping:
      return { from: expr.leftParen.from, to: tokenBounds(expr.rightParen).to };
    case Expr.Is.List:
      throw new Error();
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
