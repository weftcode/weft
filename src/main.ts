import { EditorView, basicSetup } from "codemirror";
import { keymap, KeyBinding } from "@codemirror/view";
import { StateEffect } from "@codemirror/state";

import { AstPrinter } from "./parser/AstPrinter";
import { Scanner } from "./parser/Scanner";
import { Parser } from "./parser/Parser";
import { error, wasError } from "./parser/Reporter";
import { Interpreter } from "./parser/Interpreter";

import { bindings, operators } from "./strudel";

import { parser } from "./language.grammar";

import { LRLanguage, LanguageSupport } from "@codemirror/language";

const language = LRLanguage.define({ parser });

export function example() {
  return new LanguageSupport(language, []);
}

const EvalEffect = StateEffect.define<void>();

const evalKeymap: KeyBinding[] = [
  {
    key: "Mod-Enter",
    run: (view) => {
      view.dispatch({ effects: EvalEffect.of() });
      return true;
    },
  },
];

const listener = EditorView.updateListener.of((update) => {
  for (let tr of update.transactions) {
    for (let effect of tr.effects) {
      if (effect.is(EvalEffect)) {
        try {
          const scanner = new Scanner(update.state.doc.toString(), error);
          const tokens = scanner.scanTokens();
          document.getElementById("output").innerText = tokens
            .map((t) => t.toString())
            .join("\n");
          const parser = new Parser(tokens);
          const stmts = parser.parse();

          const interpreter = new Interpreter(error, bindings, operators);

          const printer = new AstPrinter();

          document.getElementById("output").innerText = interpreter
            .interpret(stmts)
            .join("\n");

          // Stop if there was a syntax error.
          if (wasError) return;
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
});

window.addEventListener("load", () => {
  new EditorView({
    extensions: [keymap.of(evalKeymap), basicSetup, listener],
    parent: document.getElementById("editor"),
  });
});
