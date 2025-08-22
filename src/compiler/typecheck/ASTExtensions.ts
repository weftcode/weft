import { Expr } from "../parse/AST/Expr";
import { Stmt } from "../parse/AST/Stmt";
import { Type } from "./Type";
import { TypeScheme } from "./TypeScheme";

export interface NodeTypeInfo {
  type: Type;
}

export type TypeExt = Stmt.Extension & {
  "Stmt.Expression": { expression: Expr<TypeExt> };
  "Expr.Variable": NodeTypeInfo & { scheme?: TypeScheme };
  "Expr.Literal": NodeTypeInfo & { scheme?: TypeScheme };
  "Expr.Application": NodeTypeInfo;
  "Expr.Binary": NodeTypeInfo;
  "Expr.Section": NodeTypeInfo;
  "Expr.List": NodeTypeInfo;
  "Expr.Grouping": NodeTypeInfo;
  "Expr.Empty": NodeTypeInfo;
  "Expr.Error": NodeTypeInfo;
};
