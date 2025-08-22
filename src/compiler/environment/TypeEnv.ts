import { Environment } from ".";
import { parseTypeString, validateQualType } from "./utils";

import { quantify, TypeScheme } from "../typecheck/TypeScheme";

export type TypeEnv = {
  readonly [name: string]: Binding;
};

export type Precedence = [number, "left" | "right"];

export interface Binding {
  type: TypeScheme;
  value: any;
  prec?: Precedence;
}

export type BindingSpec = Omit<Binding, "type"> & {
  name: string;
  type: string;
};

export function addBinding(
  env: Environment,
  { name, type: typeString, value, prec }: BindingSpec
): Environment {
  try {
    let type = quantify([], validateQualType(parseTypeString(typeString), env));

    return {
      ...env,
      typeEnv: { ...env.typeEnv, [name]: { type, value, prec } },
    };
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Error with "${name}" binding: ${e.message}`);
    } else {
      throw e;
    }
  }
}
