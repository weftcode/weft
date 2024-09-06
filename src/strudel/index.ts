import { Bindings, expandSynonyms } from "../parser/API";

import { operators } from "./operators";

import { core } from "./core";
import { controls } from "./controls";
import { boot } from "./boot";
export { hush } from "./boot";

export const bindings: Bindings = expandSynonyms({
  ...operators,
  ...core,
  ...controls,
  ...boot,
});

export const typeBindings: { [name: string]: string } = Object.fromEntries(
  Object.entries(bindings).flatMap(([name, { type }]) =>
    type.length > 0 ? [[name, type]] : []
  )
);
