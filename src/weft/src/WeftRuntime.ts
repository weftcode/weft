import { Stmt } from "../../compiler/parse/AST/Stmt";
import { expressionBounds } from "../../compiler/parse/Utils";

import { Scanner } from "../../compiler/scan/Scanner";
import { Parser } from "../../compiler/parse/Parser";
import { renameStmt } from "../../compiler/rename/Renamer";
import { typecheckStmt } from "../../compiler/typecheck/TypeCheck";
import { Interpreter, Location } from "../../compiler/Interpreter";
import { collectErrors } from "../../compiler/errors/Errors";

import {
  addBinding,
  addClass,
  addDataType,
  addInstance,
  Environment,
  listBindingNames,
  makeEnv,
} from "../../compiler/environment";
import { Evaluation } from "../../editor/console";

import { Diagnostic } from "@codemirror/lint";
import { collectRenameErrors } from "../../compiler/errors/Renamer";
import { TypeExt } from "../../compiler/typecheck/ASTExtensions";
import { SolverError } from "../../compiler/typecheck/Solver";
import { Expr } from "../../compiler/parse/AST/Expr";
import { printQualType } from "../../compiler/typecheck/Printer";
import { asScheme } from "../../compiler/typecheck/TypeScheme";

import { BindingSpec, validateSpec } from "./environment/Type";
import { ModuleSpec, validateModule } from "./environment/ModuleSpec";

export interface ParseResult {
  stmts: Stmt<TypeExt>[];
  diagnostics: Diagnostic[];
}

interface EvaluationResults {
  results: Evaluation[];
  miniLocations?: Location[];
}

export class WeftRuntime {
  private evalCounter = 0;

  private env = makeEnv();

  constructor() {}

  loadLibrary(lib: (env: Environment) => Environment) {
    this.env = lib(this.env);
  }

  loadModule(module: ModuleSpec) {
    let { classes, instances, datatypes, vars } = validateModule(module);

    for (let [name, classDec] of Object.entries(classes)) {
      this.env = addClass(this.env, name, classDec);
    }

    // Instances
    for (let [name, instanceDec] of Object.entries(instances)) {
      // this.env = addInstance(this.env, name, instanceDec);
    }

    // Datatypes
    for (let [name, datatype] of Object.entries(datatypes)) {
      // this.env = addDataType(this.env, name, datatype);
    }

    for (let [name, binding] of Object.entries(vars)) {
      this.env = addBinding(this.env, name, binding);
    }
  }

  addBinding(name: string, spec: BindingSpec) {
    this.env = addBinding(this.env, name, validateSpec(name, spec));
  }

  get bindings() {
    return listBindingNames(this.env);
  }

  async parse(code: string): Promise<ParseResult> {
    let diagnostics: Diagnostic[] = [];
    let typedStmts: Stmt<TypeExt>[] = [];

    try {
      const scanner = new Scanner(code);
      const tokens = scanner.scanTokens();
      const parser = new Parser(tokens, this.env);
      const stmts = parser.parse();

      diagnostics.push(...collectErrors(stmts));

      // Run renamer to check for undefined variables
      let renamedStmts = stmts.map((s) => renameStmt(s, this.env));

      diagnostics.push(...collectRenameErrors(renamedStmts));

      // TODO: This is kinda clunky
      let allTypeErrors: SolverError[] = [];

      for (let stmt of renamedStmts) {
        let [typedStmt, typeErrors] = typecheckStmt(stmt, this.env);
        typedStmts.push(typedStmt);
        allTypeErrors.push(...typeErrors);
      }

      for (let typeError of allTypeErrors) {
        diagnostics.push({ severity: "error", ...typeError });
      }

      diagnostics.push(...collectTypeInfo(typedStmts));
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

    return { stmts: typedStmts, diagnostics };
  }

  evaluate(code: string, offset = 0): EvaluationResults {
    let results: Evaluation[] = [];
    let miniLocations: Location[] | undefined;

    try {
      const scanner = new Scanner(code);
      const tokens = scanner.scanTokens();
      const parser = new Parser(tokens, this.env);
      const stmts = parser.parse();

      const errors = collectErrors(stmts);

      const renamedStmts = stmts.map((stmt) => renameStmt(stmt, this.env));

      errors.push(...collectRenameErrors(renamedStmts));

      // TODO: This is kinda clunky
      let typedStmts: Stmt<TypeExt>[] = [];
      let allTypeErrors: SolverError[] = [];

      for (let stmt of renamedStmts) {
        let [typedStmt, typeErrors] = typecheckStmt(stmt, this.env);
        typedStmts.push(typedStmt);
        allTypeErrors.push(...typeErrors);
      }

      for (let typeError of allTypeErrors) {
        errors.push({ severity: "error", ...typeError });
      }

      if (errors.length === 0) {
        const interpreter = new Interpreter(this.env);

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
      } else {
        for (let error of errors) {
          results.push({
            input: code,
            success: false,
            text: "Error: " + error.message,
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

export function collectTypeInfo(stmts: Stmt<TypeExt>[]): Diagnostic[] {
  return stmts.flatMap((stmt) => {
    switch (stmt.is) {
      case Stmt.Is.Expression:
        return collectTypeInfoExpr(stmt.expression);
      case Stmt.Is.Error:
        return [];
      default:
        return stmt satisfies never;
    }
  });
}

function collectTypeInfoExpr(expr: Expr<TypeExt>): Diagnostic[] {
  // Dispense with the simplest cases
  switch (expr.is) {
    case Expr.Is.Grouping:
      return collectTypeInfoExpr(expr.expression);
    case Expr.Is.Empty:
    case Expr.Is.Error:
      return [];
  }

  switch (expr.is) {
    case Expr.Is.Variable:
    case Expr.Is.Literal:
      return [
        {
          severity: "info",
          message: printQualType(expr.scheme?.qual ?? asScheme(expr.type).qual),
          ...expressionBounds(expr),
        },
      ];

    case Expr.Is.Application:
      return [
        ...collectTypeInfoExpr(expr.left),
        ...collectTypeInfoExpr(expr.right),
      ];
    case Expr.Is.Binary:
      return [
        ...collectTypeInfoExpr(expr.left),
        ...collectTypeInfoExpr(expr.operator),
        ...collectTypeInfoExpr(expr.right),
      ];
    case Expr.Is.Lambda:
      return [
        ...expr.parameters.flatMap(collectTypeInfoExpr),
        ...collectTypeInfoExpr(expr.expression),
      ];
    case Expr.Is.Section:
      return [
        ...collectTypeInfoExpr(expr.operator),
        ...collectTypeInfoExpr(expr.expression),
      ];
    case Expr.Is.List:
      return expr.items.flatMap((e) => collectTypeInfoExpr(e));
    default:
      return expr satisfies never;
  }
}
