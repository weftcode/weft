import { Scanner } from "../compiler/scan/Scanner";
import { Parser } from "../compiler/parse/Parser";
import { renamer } from "../compiler/rename/Renamer";
import { TypeChecker } from "../compiler/typecheck/Typechecker";
import { ErrorReporter } from "../compiler/parse/Reporter";
import { Interpreter } from "../compiler/Interpreter";
import { Bindings, getOperators } from "../compiler/parse/API";

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

export const evalTheme = EditorView.theme({
  "@keyframes cm-eval-flash": {
    from: { backgroundColor: "#FFFFFF" },
    to: { backgroundColor: "#FFFFFF00" },
  },
  "& .cm-evaluated": { animation: "cm-eval-flash 0.5s" },
});

type TypeBindings = { [id: string]: string };

interface EvaluationResults {
  results: Evaluation[];
  miniLocations: Location[];
}

export function handleEvaluation(
  code: string,
  bindings: Bindings
): EvaluationResults {
  let reporter = new ErrorReporter();

  try {
    const scanner = new Scanner(code);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens, getOperators(bindings), reporter);
    const stmts = parser.parse();

    renamer(stmts, bindings, reporter);

    if (!reporter.hasError) {
      let typechecker = new TypeChecker(reporter, typeBindings);

      for (let stmt of stmts) {
        let [sub, expr] = typechecker.check(stmt);
        generateTypeDiagnostics(sub, expr).forEach((annotation) => {
          if (annotation.severity === "error") {
            reporter.error(annotation.from, annotation.to, annotation.message);
          }
        });
      }
    }

    if (reporter.hasError) {
      consoleComponent.update({
        input: code,
        success: false,
        text:
          "Error: " + reporter.errors.map((error) => error.message).join("\n"),
      });
    } else {
      const interpreter = new Interpreter(reporter, bindings);

      let results = interpreter.interpret(stmts, 0);
      let text = [...results, ...reporter.errors].join("\n");

      if (text === "") {
        return;
      }

      consoleComponent.update({
        input: code,
        success: true,
        text,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      consoleComponent.update({
        input: code,
        success: false,
        text: "Error: " + error.message,
      });
    }
  }
}

export function evaluation(
  bindings: Bindings,
  typeBindings: TypeBindings
): Extension {
  const listener = EditorState.transactionExtender.of((tr) => {
    let effects: StateEffect<any>[] = [];

    for (let effect of tr.effects) {
      if (effect.is(evalEffect)) {
        let { from, to } = effect.value;
        let code = tr.newDoc.sliceString(from, to);
        let locations = handleEvaluation(code, bindings, typeBindings);

        if (locations) {
          effects.push(replaceMininotation(from, to, locations));
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
