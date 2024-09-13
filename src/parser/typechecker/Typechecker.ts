import { Expr, expressionBounds } from "../Expr";
import { Stmt } from "../Stmt";
import { Environment } from "../Environment";
import { ErrorReporter } from "../Reporter";

import { Scanner } from "../Scanner";
import { TypeParser } from "./TypeParser";

import { toCore } from "./core/toCore";
import { makeContext, PolyType } from "./Types";
import { ParseError } from "../BaseParser";
import { W } from "./Inference";
import { UnificationError } from "./Utilities";

export class TypeChecker {
  private environment: { [name: string]: PolyType } = {};

  constructor(
    private readonly reporter: ErrorReporter,
    bindings: { [name: string]: string }
  ) {
    for (let [name, typeString] of Object.entries(bindings)) {
      let tokens = new Scanner(typeString).scanTokens();

      try {
        let type = new TypeParser(tokens, reporter).parse();

        this.environment[name] = type;
      } catch (e) {
        if (e instanceof Error) {
          console.log("Error parsing type definition:");
          console.log(typeString);
          console.log(e.message);
        } else {
          throw e;
        }
      }
    }
  }

  check(statements: Stmt[]) {
    for (let statement of statements) {
      try {
        switch (statement.type) {
          case Stmt.Type.Expression:
            return W(
              makeContext(this.environment),
              toCore(statement.expression)
            );
          default:
            return statement.type satisfies never;
        }
      } catch (e) {
        if (e instanceof UnificationError && e.type2.source) {
          const { from, to } =
            "from" in e.type2.source
              ? e.type2.source
              : expressionBounds(e.type2.source);
          this.reporter.error(from, to, e.message);
        }

        return [];
      }
    }
  }
}
