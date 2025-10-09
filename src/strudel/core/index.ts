import { ModuleSpec } from "../../weft/src/environment/ModuleSpec";

import * as pattern from "./pattern";
import * as signal from "./signal";
import * as pick from "./pick";
import * as euclid from "./euclid";

export default {
  datatypes: {
    Any: { dataCons: [] },
    Span: { dataCons: [] },
    "Hap a": { dataCons: [] },
    "Pattern a": { dataCons: [] },
    Controls: { dataCons: [] },
  },
  vars: {
    ...fromImport(pattern),
    ...fromImport(signal),
    ...fromImport(pick),
    ...fromImport(euclid),
  },
} satisfies ModuleSpec;

interface AnnotatedImport {
  $Types: string;
  [name: string]: any;
}

function fromImport({ $Types, ...exports }: AnnotatedImport) {
  let vars: ModuleSpec["vars"] = {};

  let parsed = $Types
    .split("\n")
    .filter((line) => line !== "" && !/^\s*--.*$/.test(line))
    .map((line) => line.split(/\s*::\s*/));

  for (let [name, type] of parsed) {
    if (name in exports) {
      vars[name] = { type, value: exports[name] };
    } else {
      // TODO throw error
    }
  }

  return vars;
}
