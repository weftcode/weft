import { Environment, getBinding } from ".";

import { TypeScheme } from "../typecheck/TypeScheme";

export type TypeEnv = {
  readonly [name: string]: Binding;
};

export type Precedence = [number, "left" | "right"];

export interface Binding {
  type: TypeScheme;
  value: any;
  prec?: Precedence;
}

export function addBinding(
  env: Environment,
  name: string,
  binding: Binding
): Environment {
  if (getBinding(env, name)) {
    throw new Error(`Tried to bind variable "${name}", but it's already bound`);
  }

  return {
    ...env,
    typeEnv: { ...env.typeEnv, [name]: binding },
  };
}
