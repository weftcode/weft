import { Expr } from "../parse/AST/Expr";
import { Stmt } from "../parse/AST/Stmt";
import { expressionBounds } from "../parse/Utils";
import { printType } from "./Printer";
import { MonoType } from "./Types";
import { Substitution } from "./Utilities";

type Severity = "info" | "warning" | "error";

export abstract class TypeAnnotation {
  constructor(readonly severity: Severity, public expr: Expr) {}

  abstract get message(): string;

  get from() {
    return expressionBounds(this.expr).from;
  }

  get to() {
    return expressionBounds(this.expr).to;
  }

  abstract apply(substitution: Substitution): void;
}

export class TypeInfoAnnotation extends TypeAnnotation {
  constructor(expr: Expr, private type: MonoType) {
    super("info", expr);
  }

  get message() {
    return printType(this.type);
  }

  apply(substitution: Substitution) {
    this.type = substitution(this.type);
  }
}

export class MissingTypeWarning extends TypeAnnotation {
  private varName: string;

  constructor(expr: Expr & { is: Expr.Is.Variable }, private type: MonoType) {
    super("warning", expr);
    this.varName = expr.name.lexeme;
  }

  get message() {
    return `Missing type annotation for ${
      this.varName
    }. Inferred type: ${printType(this.type)}`;
  }

  apply(substitution: Substitution) {
    this.type = substitution(this.type);
  }
}

export class UnificationError extends TypeAnnotation {
  constructor(expr: Expr, private type1: MonoType, private type2: MonoType) {
    super("error", expr);
  }

  get message() {
    return `Type mismatch: Expected type (${printType(
      this.type1
    )}) but got (${printType(this.type2)}) instead`;
  }

  apply(substitution: Substitution) {
    this.type1 = substitution(this.type1);
    this.type2 = substitution(this.type2);
  }
}

export class ApplicationError extends TypeAnnotation {
  constructor(expr: Expr) {
    super("error", expr);
  }

  get message() {
    return `Type error: Applying too many arguments to a function`;
  }

  apply() {}
}

export type NodeTypeInfo = {
  type: MonoType | null;
  typeAnnotation?: TypeAnnotation;
};

export type TypeInfo = {
  "Stmt.Expression": NodeTypeInfo;
  "Expr.Variable": NodeTypeInfo;
  "Expr.Literal": NodeTypeInfo;
  "Expr.Application": NodeTypeInfo;
  "Expr.Binary": NodeTypeInfo;
  "Expr.Section": NodeTypeInfo;
  "Expr.List": NodeTypeInfo;
} & Stmt.Extension;

export function getType(expr: Expr<TypeInfo>): MonoType | null {
  if (expr.is === Expr.Is.Grouping) {
    return getType(expr.expression);
  } else if (expr.is === Expr.Is.Empty) {
    return null;
  } else {
    return expr.type;
  }
}

export function applyToExpr<T extends Expr<TypeInfo>>(
  expr: T,
  sub: Substitution
): T {
  switch (expr.is) {
    case Expr.Is.Empty:
      return expr;
    case Expr.Is.Literal:
    case Expr.Is.Variable: {
      const { type } = expr;
      return { ...expr, type: type && sub(type) };
    }
    case Expr.Is.Application: {
      const { left, right, type } = expr;
      return {
        ...expr,
        left: applyToExpr(left, sub),
        right: applyToExpr(right, sub),
        type: type && sub(type),
      };
    }
    case Expr.Is.Binary: {
      const { left, right, operator, type } = expr;
      return {
        ...expr,
        left: applyToExpr(left, sub),
        right: applyToExpr(right, sub),
        operator: applyToExpr(operator, sub),
        type: type && sub(type),
      };
    }
    case Expr.Is.Grouping: {
      const { expression } = expr;
      return { ...expr, expression: applyToExpr(expression, sub) };
    }
    case Expr.Is.Section: {
      const { expression, operator, type } = expr;
      return {
        ...expr,
        expression: applyToExpr(expression, sub),
        operator: applyToExpr(operator, sub),
        type: type && sub(type),
      };
    }
    case Expr.Is.List: {
      const { items, type } = expr;
      return {
        ...expr,
        items: items.map((item) => applyToExpr(item, sub)),
        type: type && sub(type),
      };
    }
    default:
      return expr satisfies never;
  }
}
