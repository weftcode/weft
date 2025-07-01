import { Stmt } from "../../compiler/parse/AST/Stmt";
import { expressionBounds } from "../../compiler/parse/Utils";

import { Scanner } from "../../compiler/scan/Scanner";
import { Parser } from "../../compiler/parse/Parser";
import { renameStmt } from "../../compiler/rename/Renamer";
import { TypeChecker } from "../../compiler/typecheck/old/TypeChecker_THIH";
import { Interpreter, Location } from "../../compiler/Interpreter";
import { collectErrors } from "../../compiler/errors/Errors";

import { makeEnv } from "../../compiler/environment";
import { Evaluation } from "../../editor/console";
import { collectTypeDiagnostics } from "../../compiler/typecheck/Annotations";

import { Diagnostic } from "@codemirror/lint";

interface EvaluationResults {
  results: Evaluation[];
  miniLocations?: Location[];
}

export class WeftRuntime {
  private evalCounter = 0;

  constructor(private env = makeEnv()) {}

  async parse(code: string): Promise<Diagnostic[]> {
    let diagnostics: Diagnostic[] = [];

    try {
      const scanner = new Scanner(code);
      const tokens = scanner.scanTokens();
      const parser = new Parser(tokens, this.env.typeEnv);
      const stmts = parser.parse();

      diagnostics.push(...collectErrors(stmts));

      // Run renamer to check for undefined variables
      let renamedStmts = stmts.map((s) => renameStmt(s, this.env.typeEnv));

      const typechecker = new TypeChecker(this.env);

      for (let stmt of renamedStmts) {
        let checked = typechecker.check(stmt);

        if (checked.is === Stmt.Is.Expression) {
          diagnostics.push(...collectTypeDiagnostics(checked.expression));
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        diagnostics.push({
          severity: "error",
          message: "Error: " + error.message,
          from: 0,
          to: code.length,
        });
      }

      throw error;
    }

    return diagnostics;
  }

  evaluate(code: string, offset = 0): EvaluationResults {
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
      [values, miniLocations] = interpreter.interpret(
        typedStmts,
        this.evalCounter++
      );

      if (miniLocations) {
        miniLocations = miniLocations
          .map<Location>(([id, { from, to }]) => [
            id,
            { from: from + offset, to: to + offset },
          ])
          .toSorted(
            ([_a, { from: fromA }], [_b, { from: fromB }]) => fromA - fromB
          );
      }

      values.forEach((text, i) => {
        if (text !== "" && stmts[i].is === Stmt.Is.Expression) {
          let { from, to } = expressionBounds(stmts[i].expression);
          results.push({
            input: code.slice(from, to),
            success: true,
            text,
          });
        }
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
