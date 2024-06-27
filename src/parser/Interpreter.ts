import { ErrorReporter } from "./Reporter";
import { Primitive, Token } from "./Token";
import { Expr } from "./Expr";
import { Stmt } from "./Stmt";
import { Environment } from "./Environment";

export class Interpreter {
  private environment = new Environment();

  constructor(
    private readonly error: ErrorReporter,
    private bindings,
    private operators
  ) {}

  interpret(statements: Stmt[]) {
    let results: string[] = [];

    try {
      results = statements.flatMap((s) => this.execute(s));
    } catch (error) {
      if (error instanceof RuntimeError) {
        this.error(error.token, error.message);
      } else {
        throw error;
      }
    }

    return results;
  }

  private stringify(object: Primitive) {
    if (object == null) return "nil";

    return object.toString();
  }

  private execute(stmt: Stmt): string[] {
    switch (stmt.type) {
      case Stmt.Type.Expression:
        let result = this.evaluate(stmt.expression);
        return result ? [this.stringify(result)] : [];
      case Stmt.Type.Print:
        //const value = this.evaluate(stmt.expression);
        //return [this.stringify(value)];
        return [];
      case Stmt.Type.Var: {
        // let value: LoxType = null;
        // if (stmt.initializer != null) {
        //   value = this.evaluate(stmt.initializer);
        // }

        // this.environment.define(stmt.name.lexeme, value);
        return [];
      }
    }
  }

  private evaluate(expr: Expr): Primitive | null {
    switch (expr.type) {
      case Expr.Type.Literal:
        return expr.value;
      case Expr.Type.Grouping:
        return this.evaluate(expr.expression);
      case Expr.Type.Binary: {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        if (expr.operator.type in this.operators) {
          return this.operators[expr.operator.type](left, right);
        }

        throw new RuntimeError(expr.operator, "Operator isn't implemented");
      }
      case Expr.Type.Variable:
        return this.environment.get(expr.name);
      case Expr.Type.Application: {
        const left = this.curry(expr.left);
        const right = this.evaluate(expr.right);
        return left(right);
      }
    }
  }

  private curry(func: Expr): Function {
    if (func.type === Expr.Type.Variable) {
      if (func.name.lexeme in this.bindings) {
        return this.bindings[func.name.lexeme];
      }
    } else if (func.type === Expr.Type.Grouping) {
      return this.curry(func.expression);
    } else if (func.type === Expr.Type.Application) {
      const arg = this.evaluate(func.right);
      return (...args: any[]) => this.curry(func.left)(arg, ...args);
    }

    throw new Error("Unexpected function");
  }
}

export class RuntimeError extends Error {
  constructor(readonly token: Token, message: string) {
    super(message);
  }
}
