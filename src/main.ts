import { EditorView, basicSetup } from "codemirror";
import { keymap, KeyBinding } from "@codemirror/view";
import { StateEffect } from "@codemirror/state";
import { linter } from "@codemirror/lint";

import { StreamLanguage } from "@codemirror/language";
import { haskell } from "@codemirror/legacy-modes/mode/haskell";

import { AstPrinter } from "./parser/AstPrinter";
import { Scanner } from "./parser/Scanner";
import { Parser } from "./parser/Parser";
import { ErrorReporter } from "./parser/Reporter";
import { Interpreter } from "./parser/Interpreter";

import { getOperators } from "./parser/API";

import { bindings, hush, typeBindings } from "./strudel";

import { printType } from "./parser/typechecker/Printer";
import { TypeChecker } from "./parser/typechecker/Typechecker";

const EvalEffect = StateEffect.define<void>();

const evalKeymap: KeyBinding[] = [
  {
    key: "Mod-Enter",
    run: (view) => {
      view.dispatch({ effects: EvalEffect.of() });
      return true;
    },
  },
  {
    key: "Mod-.",
    run: () => {
      hush();
      return true;
    },
  },
];

const autosave = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    localStorage.setItem("document", update.state.doc.toString());
  }
});

const listener = EditorView.updateListener.of((update) => {
  for (let tr of update.transactions) {
    for (let effect of tr.effects) {
      if (effect.is(EvalEffect)) {
        let reporter = new ErrorReporter();

        try {
          const scanner = new Scanner(update.state.doc.toString());
          const tokens = scanner.scanTokens();
          document.getElementById("output").innerText = tokens
            .map((t) => t.toString())
            .join("\n");
          const parser = new Parser(tokens, getOperators(bindings), reporter);
          const stmts = parser.parse();

          // TODO: Error Handling

          const printer = new AstPrinter();
          document.getElementById("output").innerText =
            printer.printStmts(stmts);

          if (!reporter.hasError) {
            let typechecker = new TypeChecker(reporter, typeBindings);
            let [_, type] = typechecker.check(stmts);
            console.log(printType(type));
          }

          if (reporter.hasError) {
            document.getElementById("output").innerText =
              reporter.errors.join("\n");
          } else {
            const interpreter = new Interpreter(reporter, bindings);

            let results = interpreter.interpret(stmts);

            document.getElementById("output").innerText = [
              ...results,
              ...reporter.errors,
            ].join("\n");
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
});

const parseLinter = linter((view) => {
  try {
    let reporter = new ErrorReporter();

    const scanner = new Scanner(view.state.doc.toString());
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens, getOperators(bindings), reporter);
    const stmts = parser.parse();

    const printer = new AstPrinter();

    const typechecker = new TypeChecker(reporter, typeBindings);
    let [_, type] = typechecker.check(stmts);

    if (reporter.hasError) {
      return reporter.errors.map(({ from, to, message }) => ({
        from,
        to,
        message,
        severity: "error",
      }));
    } else {
      document.getElementById("output").innerText = printer.printStmts(stmts);

      return [];
    }
  } catch (error) {
    console.log(error);
  }
});

window.addEventListener("load", () => {
  new EditorView({
    doc: localStorage.getItem("document") ?? "",
    extensions: [
      keymap.of(evalKeymap),
      basicSetup,
      listener,
      StreamLanguage.define(haskell),
      parseLinter,
      autosave,
    ],
    parent: document.getElementById("editor"),
  });
});
