import { Token, tokenBounds } from "../../scan/Token";
import { TokenType } from "../../scan/TokenType";

export type Expr<Extend extends Expr.Extension = Expr.Extension> =
  | Expr.Application<Extend>
  | Expr.Binary<Extend>
  | Expr.Section<Extend>
  | Expr.Grouping<Extend>
  | Expr.List<Extend>
  | Expr.Literal<Extend>
  | Expr.Variable<Extend>
  | Expr.Empty<Extend>;

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

  export interface Extension {
    "Expr.Application": object;
    "Expr.Binary": object;
    "Expr.Section": object;
    "Expr.Grouping": object;
    "Expr.List": object;
    "Expr.Literal": object;
    "Expr.Variable": object;
    "Expr.Empty": object;
  }

  export type Empty<Extend extends Extension = Extension> = {
    is: Is.Empty;
  } & Extend["Expr.Empty"];

  export type Binary<Extend extends Extension = Extension> = {
    is: Is.Binary;
    left: Expr<Extend>;
    operator: Variable<Extend>;
    right: Expr<Extend>;
    precedence: number;
  } & Extend["Expr.Binary"];

  export type Section<Extend extends Extension = Extension> = {
    is: Is.Section;
    operator: Variable<Extend>;
    expression: Expr<Extend>;
    side: "left" | "right";
  } & Extend["Expr.Section"];

  export type Grouping<Extend extends Extension = Extension> = {
    is: Is.Grouping;
    expression: Expr<Extend>;
    leftParen: Token;
    rightParen: Token;
  } & Extend["Expr.Grouping"];

  export type List<Extend extends Extension = Extension> = {
    is: Is.List;
    items: Expr<Extend>[];
    leftBracket: Token;
    rightBracket: Token;
  } & Extend["Expr.List"];

  export type Literal<Extend extends Extension = Extension> = {
    is: Is.Literal;
    token: Omit<Token, "type"> & { type: TokenType.Number | TokenType.String };
  } & Extend["Expr.Literal"];

  export type Variable<Extend extends Extension = Extension> = {
    is: Is.Variable;
    name: Token;
  } & Extend["Expr.Variable"];

  export type Application<Extend extends Extension = Extension> = {
    is: Is.Application;
    left: Expr<Extend>;
    right: Expr<Extend>;
  } & Extend["Expr.Application"];
}
