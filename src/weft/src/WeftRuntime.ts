import type { Stmt } from "../../compiler/parse/AST/Stmt";
import { expressionBounds } from "../../compiler/parse/Utils";

import { Scanner } from "../../compiler/scan/Scanner";
import { Parser } from "../../compiler/parse/Parser";
import { renamer } from "../../compiler/rename/Renamer";
import { TypeChecker } from "../../compiler/typecheck/Typechecker";
import { Interpreter } from "../../compiler/Interpreter";

import { ErrorReporter } from "../../compiler/parse/Reporter";
import { makeEnv } from "../../compiler/environment";
import { Evaluation } from "../../editor/console";
import type { TypeInfo } from "../../compiler/typecheck/Annotations";

import preludeLib from "../../standard-lib";

interface EvaluationResults {
  results: Evaluation[];
  miniLocations?: Location[];
}

export class WeftRuntime {
  private env = makeEnv();

  private evalCounter = 0;

  constructor() {
    this.env = preludeLib(this.env);
  }

  async evaluate(code: string, offset = 0): Promise<EvaluationResults> {
    let reporter = new ErrorReporter();

    let results: Evaluation[] = [];
    let miniLocations: Location[] | undefined;

    try {
      const scanner = new Scanner(code);
      const tokens = scanner.scanTokens();
      const parser = new Parser(tokens, this.env.typeEnv, reporter);
      const stmts = parser.parse();

      renamer(stmts, this.env.typeEnv, reporter);

      let typedStmts: Stmt<TypeInfo>[] = [];

      if (!reporter.hasError) {
        let typechecker = new TypeChecker(reporter, this.env);

        for (let stmt of stmts) {
          let typedStmt = typechecker.check(stmt);
          typedStmts.push(typedStmt);
          // generateTypeDiagnostics(sub, expr).forEach((annotation) => {
          //   if (annotation.severity === "error") {
          //     reporter.error(annotation.from, annotation.to, annotation.message);
          //   }
          // });
        }
      }

      if (reporter.hasError) {
        results.push({
          input: code,
          success: false,
          text:
            "Error: " +
            reporter.errors.map((error) => error.message).join("\n"),
        });
      } else {
        const interpreter = new Interpreter(reporter, this.env.typeEnv);

        let values: string[];
        let miniLocations;
        [values, miniLocations] = interpreter.interpret(
          typedStmts,
          this.evalCounter++
        );

        if (miniLocations) {
          miniLocations = miniLocations.map(([id, { from, to }]) => [
            id,
            { from: from + offset, to: to + offset },
          ]);
        }

        values.forEach((text, i) => {
          if (text !== "") {
            let { from, to } = expressionBounds(stmts[i].expression);
            results.push({
              input: code.slice(from, to),
              success: true,
              text,
            });
          }
        });

        if (reporter.hasError) {
          results.push({
            input: code,
            success: false,
            text:
              "Error: " +
              reporter.errors.map((error) => error.message).join("\n"),
          });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        results.push({
          input: code,
          success: false,
          text: "Error: " + error.message,
        });
      }

      throw error;
    }

    return { results, miniLocations };
  }
}
