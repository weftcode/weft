import { Token, LoxType } from "./Token";
import { RuntimeError } from "./Interpreter";

export class Environment {
  private values = new Map<string, LoxType>();

  constructor(private enclosing: Environment | null = null) {}

  define(name: string, value: LoxType) {
    this.values.set(name, value);
  }

  get(name: Token) {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    if (this.enclosing != null) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }

  assign(name: Token, value: LoxType) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }
}
