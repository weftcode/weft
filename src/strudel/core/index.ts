import {
  Environment,
  addDataType,
  addBinding,
} from "../../compiler/environment";
import { KFunc, KType } from "../../compiler/typecheck/BuiltIns";

import * as pattern from "./pattern";

export default (env: Environment) => {
  env = addDataType(env, {
    name: "Any",
    kind: KType,
    dataCons: [],
  });

  env = addDataType(env, {
    name: "Span",
    kind: KType,
    dataCons: [],
  });

  env = addDataType(env, {
    name: "Pattern",
    kind: KFunc(KType, KType),
    dataCons: [],
  });

  env = addDataType(env, { name: "Controls", kind: KType, dataCons: [] });

  env = addModule(env, pattern);

  return env;
};

interface ModuleSpec {
  $Types: string;
  [name: string]: any;
}

function addModule(env: Environment, module: ModuleSpec) {
  let { $Types, ...exports } = module;
  let parsed = $Types.split("\n").map((line) => line.split(/\s*::\s*/));

  for (let [name, type] of parsed) {
    if (name in exports) {
      env = addBinding(env, { name, type, value: exports[name] });
    } else {
    }
  }

  return env;
}
