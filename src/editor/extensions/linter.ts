import { StateEffect, StateField } from "@codemirror/state";
import { ViewPlugin } from "@codemirror/view";
import { linter } from "@codemirror/lint";

import type { WeftRuntime } from "../../weft/src";

// const setTreeEffect = StateEffect.define<ParseResult>();

// const identifiers = StateField.define<ParseResult>({
//   create: () => ({ stmts: [], diagnostics: [] }),
//   update: (value, { effects }) => {
//     for (let effect of effects) {
//       if (effect.is(setTreeEffect)) {
//         value = effect.value;
//       }
//     }

//     return value;
//   },
// });

// export const runtimePlugin = ViewPlugin.define((view) => {
//   return {};
// });

export function parseLinter(runtime: WeftRuntime) {
  return linter((view) =>
    runtime
      .parse(view.state.doc.toString())
      .then(({ diagnostics }) => diagnostics)
  );
}
