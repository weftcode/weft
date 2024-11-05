import { Scanner } from "../compiler/scan/Scanner";
import { Parser } from "../compiler/parse/Parser";
import { TypeChecker } from "../compiler/typecheck/Typechecker";
import { ErrorReporter } from "../compiler/parse/Reporter";
import { Interpreter } from "../compiler/Interpreter";
import { Bindings, getOperators } from "../compiler/parse/API";

import { EditorView } from "codemirror";
import { EditorState, Extension, StateEffect } from "@codemirror/state";
import { keymap } from "@codemirror/view";

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

function handleEvaluation(
  code: string,
  bindings: Bindings,
  typeBindings: TypeBindings
) {
  let reporter = new ErrorReporter();

  try {
    const scanner = new Scanner(code);
    const tokens = scanner.scanTokens();
    document.getElementById("output").innerText = tokens
      .map((t) => t.toString())
      .join("\n");
    const parser = new Parser(tokens, getOperators(bindings), reporter);
    const stmts = parser.parse();

    if (!reporter.hasError) {
      let typechecker = new TypeChecker(reporter, typeBindings);

      for (let stmt of stmts) {
        typechecker.check(stmt);
      }
    }

    if (reporter.hasError) {
      document.getElementById("output").innerText = reporter.errors.join("\n");
    } else {
      const interpreter = new Interpreter(reporter, bindings);

      let [results, locations] = interpreter.interpret(stmts, 0);

      document.getElementById("output").innerText = [
        ...results,
        ...reporter.errors,
      ].join("\n");

      return locations;
    }
  } catch (error) {
    console.log(error);
  }
}
