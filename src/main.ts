import { EditorView, basicSetup } from "codemirror";

import { Scanner } from "./parser/Scanner";
import { Parser } from "./parser/Parser";
import { error, wasError } from "./parser/Reporter";
import { Interpreter } from "./parser/Interpreter";

const listener = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    try {
      const scanner = new Scanner(update.state.doc.toString(), error);
      const tokens = scanner.scanTokens();
      document.getElementById("output").innerText = tokens
        .map((t) => t.toString())
        .join("\n");
      const parser = new Parser(tokens);
      const expression = parser.parse();

      const interpreter = new Interpreter(error);
      document.getElementById("output").innerText =
        interpreter.interpret(expression);

      // Stop if there was a syntax error.
      if (wasError) return;
    } catch (error) {
      console.log(error);
    }
  }
});

window.addEventListener("load", () => {
  new EditorView({
    extensions: [basicSetup, listener],
    parent: document.getElementById("editor"),
  });
});
