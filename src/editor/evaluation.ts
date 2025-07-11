import { EditorView } from "codemirror";
import { EditorState, Extension, StateEffect } from "@codemirror/state";
import { keymap } from "@codemirror/view";

import type { console as editorConsole, Evaluation } from "./console";

import {
  evaluationEffect,
  evaluationKeymap,
  evaluateDecorationPlugin,
} from "@management/cm-evaluate";

import {
  mininotationStringField,
  replaceMininotation,
} from "../strudel/highlights/state";

import { WeftRuntime } from "../weft/src";

// export const evalTheme = EditorView.theme({
//   "@keyframes cm-eval-flash": {
//     from: { backgroundColor: "#FFFFFF" },
//     to: { backgroundColor: "#FFFFFF00" },
//   },
//   "& .cm-evaluated": { animation: "cm-eval-flash 0.5s" },
// });

export function evaluation(
  runtime: WeftRuntime,
  consoleComponent: ReturnType<typeof editorConsole>
): Extension {
  const listener = EditorState.transactionExtender.of((tr) => {
    let effects: StateEffect<any>[] = [];

    for (let effect of tr.effects) {
      if (effect.is(evaluationEffect)) {
        let { code, span } = effect.value;
        let { results, miniLocations } = runtime.evaluate(code, span?.from);

        for (let result of results) {
          consoleComponent.update(result);
        }

        if (miniLocations && span) {
          let { from, to } = span;
          effects.push(replaceMininotation(from, to, miniLocations));
        }
      }
    }

    return { effects };
  });

  return [
    listener,
    // evalTheme,
    keymap.of(evaluationKeymap),
    evaluateDecorationPlugin,
    mininotationStringField,
  ];
}
