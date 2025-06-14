import { linter } from "@codemirror/lint";

import type { WeftRuntime } from "../weft/src";

export function parseLinter(runtime: WeftRuntime) {
  return linter((view) => runtime.parse(view.state.doc.toString()));
}
