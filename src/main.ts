import { EditorView, basicSetup } from "codemirror";
import { keymap, KeyBinding } from "@codemirror/view";
import { StateEffect } from "@codemirror/state";

import { StreamLanguage } from "@codemirror/language";
import { haskell } from "@codemirror/legacy-modes/mode/haskell";

import { AstPrinter } from "./parser/AstPrinter";
import { Scanner } from "./parser/Scanner";
import { Parser } from "./parser/Parser";
import { ErrorReporter } from "./parser/Reporter";
import { Interpreter } from "./parser/Interpreter";

import { bindings, operators, hush, typeBindings } from "./strudel";
import { operators as opPrecedence } from "./strudel/operators";

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

const listener = EditorView.updateListener.of((update) => {
  for (let tr of update.transactions) {
    for (let effect of tr.effects) {
      if (effect.is(EvalEffect)) {
        let reporter = new ErrorReporter();

        try {
          const scanner = new Scanner(update.state.doc.toString(), reporter);
          const tokens = scanner.scanTokens();
          document.getElementById("output").innerText = tokens
            .map((t) => t.toString())
            .join("\n");
          const parser = new Parser(tokens, opPrecedence, reporter);
          const stmts = parser.parse();

          // TODO: Error Handling

          const printer = new AstPrinter();
          document.getElementById("output").innerText =
            printer.printStmts(stmts);

          if (!reporter.hasError) {
            let typechecker = new TypeChecker(reporter, typeBindings);
            typechecker.check(stmts);
          }

          if (reporter.hasError) {
            document.getElementById("output").innerText =
              reporter.errors.join("\n");
          } else {
            const interpreter = new Interpreter(reporter, bindings, operators);

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

window.addEventListener("load", () => {
  new EditorView({
    extensions: [
      keymap.of(evalKeymap),
      basicSetup,
      listener,
      StreamLanguage.define(haskell),
    ],
    parent: document.getElementById("editor"),
  });
});
