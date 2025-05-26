import { Stmt } from "../parse/AST/Stmt";

export type RenamerExt = {
  "Expr.Variable": {
    missing?: true;
  };
} & Stmt.Extension;
