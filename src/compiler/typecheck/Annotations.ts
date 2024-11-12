import { Expr } from "../parse/AST/Expr";
import { Stmt } from "../parse/AST/Stmt";
import { expressionBounds } from "../parse/Utils";
import { printType } from "./Printer";
import { MonoType } from "./Types";
import { Substitution } from "./Utilities";

import type { Diagnostic } from "@codemirror/lint";

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
  if ("typeAnnotation" in expr && expr.typeAnnotation) {
    expr.typeAnnotation.apply(sub);
  }

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

export function collectTypeDiagnostics(expr: Expr<TypeInfo>): Diagnostic[] {
  // Dispense with the simplest cases
  switch (expr.is) {
    case Expr.Is.Grouping:
      return collectTypeDiagnostics(expr.expression);
    case Expr.Is.Empty:
      return [];
  }

  // Now, check for a type annotation
  let { typeAnnotation } = expr;
  if (typeAnnotation) {
    console.log("Found type error annotation");
    return [typeAnnotation];
  }

  switch (expr.is) {
    case Expr.Is.Variable:
    case Expr.Is.Literal:
      let type = getType(expr);
      return type ? [new TypeInfoAnnotation(expr, type)] : [];

    case Expr.Is.Application:
    case Expr.Is.Binary:
      return collectTypeDiagnostics(expr.left).concat(
        collectTypeDiagnostics(expr.right)
      );
    case Expr.Is.Section:
      return collectTypeDiagnostics(expr.expression);
    case Expr.Is.List:
      return expr.items.flatMap((e) => collectTypeDiagnostics(e));
    default:
      return expr satisfies never;
  }
}
