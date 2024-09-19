import { Expr, expressionBounds } from "../Expr";
import { printType } from "./Printer";
import { MonoType } from "./Types";
import { Substitution } from "./Utilities";

type Severity = "info" | "warning" | "error";

export abstract class TypeAnnotation {
  constructor(readonly severity: Severity, readonly expr: Expr) {}

  abstract get message(): string;

  get from() {
    return expressionBounds(this.expr).from;
  }

  get to() {
    return expressionBounds(this.expr).to;
  }

  abstract apply(substitution: Substitution): void;
}

export class TypeInfo extends TypeAnnotation {
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

  constructor(
    expr: Expr & { type: Expr.Type.Variable },
    private type: MonoType
  ) {
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
