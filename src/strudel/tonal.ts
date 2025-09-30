// @ts-nocheck

import * as strudelTonal from "@strudel/tonal";
import { addBinding, BindingSpec } from "../compiler/environment";
import { validateSpec } from "../weft/src/environment/Type";

export default (env: Environment) => {
  for (let [name, binding] of Object.entries(tonal)) {
    env = addBinding(env, name, validateSpec(name, binding));
  }

  return env;
};

const tonal: BindingSpec = {
  addVoicings: {
    type: "String -> [(String, [String])] -> (Number, Number) -> IO ()",
    value: (...args) => ({ runIO: () => strudelTonal.addVoicings(...args) }),
  },
  // Internal?
  // registerVoicings: { type: "", value: strudelTonal.registerVoicings },
  rootNotes: {
    type: "Pattern Number -> Pattern Number -> Pattern Number",
    value: strudelTonal.rootNotes,
  },
  scale: {
    type: "Pattern String -> Pattern Controls -> Pattern Controls",
    value: strudelTonal.scale,
  },
  scaleTranspose: {
    type: "Pattern Number -> Pattern Controls -> Pattern Controls",
    value: strudelTonal.scaleTranspose,
  },
  // Internal?
  // setVoicingRange: { type: "", value: strudelTonal.setVoicingRange },
  // Pattern Interval really, but it doesn't really matter
  transpose: {
    type: "Pattern Number -> Pattern Controls -> Pattern Controls",
    value: strudelTonal.transpose,
  },
  voicing: {
    type: "Pattern Controls -> Pattern Controls",
    value: strudelTonal.voicing,
  },
  // Internal?
  // voicingAlias: { type: "", value: strudelTonal.voicingAlias },
  // Internal?
  // voicingRegistry: { type: "", value: strudelTonal.voicingRegistry },
  // Deprecated
  voicings: {
    type: "String -> Pattern String -> Pattern Number",
    value: strudelTonal.voicings,
  },
};
