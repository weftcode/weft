import { Token } from "./Token";
import { RuntimeError } from "./Interpreter";

export class Environment<V> {
  private values = new Map<string, V>();

  constructor(private enclosing: Environment<V> | null = null) {}

  define(name: string, value: V) {
    this.values.set(name, value);
  }

  get(name: Token): V {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    if (this.enclosing != null) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }

  assign(name: Token, value: V) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }
}
