import { Scanner } from "../compiler/scan/Scanner";
import { Parser } from "../compiler/parse/Parser";
import { Stmt } from "../compiler/parse/AST/Stmt";
import { renameStmt } from "../compiler/rename/Renamer";
import { TypeChecker } from "../compiler/typecheck/Typechecker";
import { Interpreter, Location } from "../compiler/Interpreter";

import { EditorView } from "codemirror";
import { EditorState, Extension, StateEffect } from "@codemirror/state";
import { keymap } from "@codemirror/view";

import type { console as editorConsole, Evaluation } from "./console";

import {
  evalDecoration,
  evalEffect,
  evalKeymap,
} from "@management/cm-evaluate";

import {
  mininotationStringField,
  replaceMininotation,
} from "../strudel/highlights/state";

import { Environment } from "../compiler/environment";
import { expressionBounds } from "../compiler/parse/Utils";
import { TypeInfo } from "../compiler/typecheck/Annotations";

export const evalTheme = EditorView.theme({
  "@keyframes cm-eval-flash": {
    from: { backgroundColor: "#FFFFFF" },
    to: { backgroundColor: "#FFFFFF00" },
  },
  "& .cm-evaluated": { animation: "cm-eval-flash 0.5s" },
});

interface EvaluationResults {
  results: Evaluation[];
  miniLocations?: Location[];
}

let evalCounter = 0;

export function handleEvaluation(
  code: string,
  offset: number,
  env: Environment
): EvaluationResults {
  let results: Evaluation[] = [];
  let miniLocations: Location[] | undefined;

  try {
    const scanner = new Scanner(code);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens, env.typeEnv);
    const stmts = parser.parse();

    const renamedStmts = stmts.map((s) => renameStmt(s, env.typeEnv));

    let typedStmts: Stmt<TypeInfo>[] = [];

    // if (!reporter.hasError) {
    let typechecker = new TypeChecker(env);

    for (let stmt of stmts) {
      let typedStmt = typechecker.check(stmt);
      typedStmts.push(typedStmt);
      // generateTypeDiagnostics(sub, expr).forEach((annotation) => {
      //   if (annotation.severity === "error") {
      //     reporter.error(annotation.from, annotation.to, annotation.message);
      //   }
      // });
    }
    // }

    // if (reporter.hasError) {
    //   results.push({
    //     input: code,
    //     success: false,
    //     text:
    //       "Error: " + reporter.errors.map((error) => error.message).join("\n"),
    //   });
    // } else {
    const interpreter = new Interpreter(env.typeEnv);

    let values: string[];
    [values, miniLocations] = interpreter.interpret(typedStmts, evalCounter++);

    if (miniLocations) {
      miniLocations = miniLocations.map(([id, { from, to }]) => [
        id,
        { from: from + offset, to: to + offset },
      ]);
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

    // if (reporter.hasError) {
    //   results.push({
    //     input: code,
    //     success: false,
    //     text:
    //       "Error: " +
    //       reporter.errors.map((error) => error.message).join("\n"),
    //   });
    // }
    // }
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

export function evaluation(
  env: Environment,
  consoleComponent: ReturnType<typeof editorConsole>
): Extension {
  const listener = EditorState.transactionExtender.of((tr) => {
    let effects: StateEffect<any>[] = [];

    for (let effect of tr.effects) {
      if (effect.is(evalEffect)) {
        let { from, to } = effect.value;
        let code = tr.newDoc.sliceString(from, to);
        let { results, miniLocations } = handleEvaluation(code, from, env);

        for (let result of results) {
          consoleComponent.update(result);
        }

        if (miniLocations) {
          effects.push(replaceMininotation(from, to, miniLocations));
        }
      }
    }

    return { effects };
  });

  return [
    listener,
    evalTheme,
    keymap.of(evalKeymap),
    evalDecoration(),
    mininotationStringField,
  ];
}
