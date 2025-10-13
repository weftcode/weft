import { BindingSpec, validateSpec } from "./Type";
import { ClassSpec, InstanceSpec, validateClassSpec } from "./TypeClass";

export interface ModuleSpec {
  classes?: { [name: string]: ClassSpec };
  instances?: { [name: string]: InstanceSpec };
  datatypes?: {};
  vars?: { [name: string]: BindingSpec };
}

export function validateModule(spec: ModuleSpec) {
  return {
    classes: Object.fromEntries(
      Object.entries(spec.classes ?? {}).map(([signature, spec]) =>
        validateClassSpec(signature, spec)
      )
    ),
    instances: {},
    datatypes: {},
    vars: Object.fromEntries(
      Object.entries(spec.vars ?? {}).map(([name, spec]) => [
        name,
        validateSpec(name, spec),
      ])
    ),
  };
}
