import { Environment } from "../compiler/typecheck/environment";

import core from "./core";
import operators from "./operators";
import controls from "./controls";
import tonal from "./tonal";
import boot from "./boot";

export { hush } from "./boot";

// @ts-ignore
export { Pattern } from "@strudel/core";
// @ts-ignore
export { m as parseMini } from "@strudel/mini";

export default (env: Environment) => {
  env = core(env);
  env = operators(env);
  env = controls(env);
  env = tonal(env);
  env = boot(env);

  return env;
};
