import { ErrorReporter } from "./Reporter";
import { LoxType, Token } from "./Token";
import { Expr } from "./Expr";
import { Stmt } from "./Stmt";
import { TokenType } from "./TokenType";
import { Environment } from "./Environment";

export class Interpreter {
  private environment = new Environment();

  constructor(private readonly error: ErrorReporter) {}

  interpret(statements: Stmt[]) {
    let results: string[] = [];

    try {
      results = statements.flatMap((s) => this.execute(s));
    } catch (error) {
      if (error instanceof RuntimeError) {
        this.error(error.token, error.message);
      }
    }

    return results;
  }

  private stringify(object: LoxType) {
    if (object == null) return "nil";

    return object.toString();
  }

  private execute(stmt: Stmt): string[] {
    switch (stmt.type) {
      case Stmt.Type.Expression:
        this.evaluate(stmt.expression);
        return [];
      case Stmt.Type.Print:
        const value = this.evaluate(stmt.expression);
        return [this.stringify(value)];
      case Stmt.Type.Var: {
        let value: LoxType = null;
        if (stmt.initializer != null) {
          value = this.evaluate(stmt.initializer);
        }

        this.environment.define(stmt.name.lexeme, value);
        return [];
      }
    }
  }

  private evaluate(expr: Expr): LoxType {
    switch (expr.type) {
      case Expr.Type.Literal:
        return expr.value;
      case Expr.Type.Grouping:
        return this.evaluate(expr.expression);
      case Expr.Type.Unary: {
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
          case TokenType.Bang:
            return !this.isTruthy(right);
          case TokenType.Minus:
            this.checkNumberOperand(expr.operator, right);
            return -(right as number);
        }

        return null;
      }
      case Expr.Type.Binary: {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
          case TokenType.Greater:
            this.checkNumberOperands(expr.operator, left, right);
            return (left as number) > (right as number);
          case TokenType.GreaterEqual:
            this.checkNumberOperands(expr.operator, left, right);
            return (left as number) >= (right as number);
          case TokenType.Less:
            this.checkNumberOperands(expr.operator, left, right);
            return (left as number) < (right as number);
          case TokenType.LessEqual:
            this.checkNumberOperands(expr.operator, left, right);
            return (left as number) <= (right as number);
          case TokenType.BangEqual:
            return left !== right;
          case TokenType.EqualEqual:
            return left === right;
          case TokenType.Minus:
            this.checkNumberOperands(expr.operator, left, right);
            return (left as number) - (right as number);
          case TokenType.Plus:
            if (typeof left === "number" && typeof right === "number") {
              return left + right;
            }

            if (typeof left === "string" && typeof right === "string") {
              return left + right;
            }

            throw new RuntimeError(
              expr.operator,
              "Operands must be two numbers or two strings."
            );
          case TokenType.Slash:
            this.checkNumberOperands(expr.operator, left, right);
            return (left as number) / (right as number);
          case TokenType.Star:
            this.checkNumberOperands(expr.operator, left, right);
            return (left as number) * (right as number);
        }

        return null;
      }
      case Expr.Type.Variable:
        return this.environment.get(expr.name);
      case Expr.Type.Assignment: {
        const value = this.evaluate(expr.value);
        this.environment.assign(expr.name, value);
        return value;
      }
    }
  }

  private isTruthy(object: LoxType) {
    if (object === null) return false;
    if (typeof object === "boolean") return object;
    return true;
  }

  private checkNumberOperand(operator: Token, operand: LoxType) {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(operator: Token, left: LoxType, right: LoxType) {
    if (typeof left === "number" && typeof right === "number") return;

    throw new RuntimeError(operator, "Operands must be numbers.");
  }
}

export class RuntimeError extends Error {
  constructor(readonly token: Token, message: string) {
    super(message);
  }
}
