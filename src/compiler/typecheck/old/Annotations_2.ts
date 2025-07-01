import { Expr } from "../../parse/AST/Expr";
import { Stmt } from "../../parse/AST/Stmt";
import { expressionBounds } from "../../parse/Utils";
import { printType } from "../Printer";
import { Type } from "../Type";
import { Substitution, applyToType } from "../Substitution";

import { TypeExt } from "../ASTExtensions";

import type { Diagnostic } from "@codemirror/lint";
import { Predicate } from "../TypeClass";

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

export class TypeExtAnnotation extends TypeAnnotation {
  constructor(expr: Expr, private type: Type) {
    super("info", expr);
  }

  get message() {
    return printType(this.type);
  }

  apply(substitution: Substitution) {
    this.type = applyToType(substitution, this.type);
  }
}

export class MissingTypeWarning extends TypeAnnotation {
  private varName: string;

  constructor(expr: Expr & { is: Expr.Is.Variable }, private type: Type) {
    super("warning", expr);
    this.varName = expr.name.lexeme;
  }

  get message() {
    return `Missing type annotation for ${
      this.varName
    }. Inferred type: ${printType(this.type)}`;
  }

  apply(substitution: Substitution) {
    this.type = applyToType(substitution, this.type);
  }
}

export class UnificationError extends TypeAnnotation {
  constructor(expr: Expr, private type1: Type, private type2: Type) {
    super("error", expr);
  }

  get message() {
    return `Type mismatch: Expected type (${printType(
      this.type1
    )}) but got (${printType(this.type2)}) instead`;
  }

  apply(substitution: Substitution) {
    this.type1 = applyToType(substitution, this.type1);
    this.type2 = applyToType(substitution, this.type2);
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

export function getType(expr: Expr<TypeExt>): Type | null {
  if (expr.is === Expr.Is.Grouping) {
    return getType(expr.expression);
  } else if (expr.is === Expr.Is.Empty || expr.is === Expr.Is.Error) {
    return null;
  } else {
    return expr.type;
  }
}

export function applyToExpr<T extends Expr<TypeExt>>(
  expr: T,
  sub: Substitution
): T {
  switch (expr.is) {
    case Expr.Is.Empty:
    case Expr.Is.Error:
      return expr;
    case Expr.Is.Literal:
    case Expr.Is.Variable: {
      const { type } = expr;
      return { ...expr, type: type && applyToType(sub, type) };
    }
    case Expr.Is.Application: {
      const { left, right, type } = expr;
      return {
        ...expr,
        left: applyToExpr(left, sub),
        right: applyToExpr(right, sub),
        type: type && applyToType(sub, type),
      };
    }
    case Expr.Is.Binary: {
      const { left, right, operator, type } = expr;
      return {
        ...expr,
        left: applyToExpr(left, sub),
        right: applyToExpr(right, sub),
        operator: applyToExpr(operator, sub),
        type: type && applyToType(sub, type),
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
        type: type && applyToType(sub, type),
      };
    }
    case Expr.Is.List: {
      const { items, type } = expr;
      return {
        ...expr,
        items: items.map((item) => applyToExpr(item, sub)),
        type: type && applyToType(sub, type),
      };
    }
    default:
      return expr satisfies never;
  }
}

export function collectTypeDiagnostics(expr: Expr<TypeExt>): Diagnostic[] {
  // Dispense with the simplest cases
  switch (expr.is) {
    case Expr.Is.Grouping:
      return collectTypeDiagnostics(expr.expression);
    case Expr.Is.Empty:
    case Expr.Is.Error:
      return [];
  }

  switch (expr.is) {
    case Expr.Is.Variable:
    case Expr.Is.Literal:
      let type = getType(expr);
      return type ? [new TypeExtAnnotation(expr, type)] : [];

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
