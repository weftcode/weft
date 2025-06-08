import type { Stmt } from "../../compiler/parse/AST/Stmt";
import { expressionBounds } from "../../compiler/parse/Utils";

import { Scanner } from "../../compiler/scan/Scanner";
import { Parser } from "../../compiler/parse/Parser";
import { renameStmt } from "../../compiler/rename/Renamer";
import { TypeChecker } from "../../compiler/typecheck/Typechecker";
import { Interpreter } from "../../compiler/Interpreter";

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
    let results: Evaluation[] = [];
    let miniLocations: Location[] | undefined;

    try {
      const scanner = new Scanner(code);
      const tokens = scanner.scanTokens();
      const parser = new Parser(tokens, this.env.typeEnv);
      const stmts = parser.parse();

      const renamedStmts = stmts.map((stmt) =>
        renameStmt(stmt, this.env.typeEnv)
      );

      let typechecker = new TypeChecker(this.env);

      let typedStmts = renamedStmts.map((stmt) => typechecker.check(stmt));

      const interpreter = new Interpreter(this.env.typeEnv);

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

      results.push({
        input: code,
        success: false,
        text:
          "Error: " + reporter.errors.map((error) => error.message).join("\n"),
      });
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
