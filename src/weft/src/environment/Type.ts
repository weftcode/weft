import { Environment, Binding } from "../../../compiler/environment";
import { quantify } from "../../../compiler/typecheck/TypeScheme";

import { validateQualType, parseTypeString } from "./utils";

export type BindingSpec = Omit<Binding, "type" | "value"> & {
  type: string;
  value?: any;
};

export function validateSpec(
  name: string,
  { type: typeString, value, prec }: BindingSpec
): Binding {
  try {
    let type = quantify([], validateQualType(parseTypeString(typeString)));

    return { type, value, prec };
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Error with "${name}" binding: ${e.message}`);
    } else {
      throw e;
    }
  }
}
