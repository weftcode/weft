import { Environment, Binding } from "../../../compiler/environment";
import { quantify } from "../../../compiler/typecheck/TypeScheme";

import { validateQualType, parseTypeString } from "./utils";

export type BindingSpec = Omit<Binding, "type"> & {
  type: string;
};

export function validateSpec(
  env: Environment,
  name: string, // TODO: Maybe this isn't necessary here?
  { type: typeString, value, prec }: BindingSpec
): Binding {
  try {
    let type = quantify([], validateQualType(parseTypeString(typeString), env));

    return { type, value, prec };
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Error with "${name}" binding: ${e.message}`);
    } else {
      throw e;
    }
  }
}
