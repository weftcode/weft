import { Bindings, expandSynonyms } from "../parser/API";

import { operators } from "./operators";

import { core } from "./core";
import { controls } from "./controls";
import { boot } from "./boot";
export { hush } from "./boot";

import * as tonal from "@strudel/tonal";

let tonalBindings: Bindings = {};

for (let [name, func] of Object.entries(tonal)) {
  tonalBindings[name] = {
    type: "",
    value: func,
  };
}

export const bindings: Bindings = expandSynonyms({
  ...operators,
  ...core,
  ...controls,
  ...boot,
  ...tonalBindings,
});

export const typeBindings: { [name: string]: string } = Object.fromEntries(
  Object.entries(bindings).flatMap(([name, { type }]) =>
    type.length > 0 ? [[name, type]] : []
  )
);
