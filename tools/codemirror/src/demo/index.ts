import { EditorView } from "codemirror";
import { LRLanguage, syntaxTree } from "@codemirror/language";

import { parser } from "../grammar/weft.grammar";

import { logTree } from "./print-lezer-tree";

window.addEventListener("load", () => {
  new EditorView({
    extensions: [
      LRLanguage.define({ parser }),
      EditorView.updateListener.of(({ state }) => {
        logTree(syntaxTree(state).cursor(), state.sliceDoc());
      }),
    ],
    parent: document.getElementById("editor") ?? undefined,
  });
});
