import { BindingSpec } from "./Type";
import { ClassSpec } from "./TypeClass";

export interface ModuleSpec {
  classes?: { [name: string]: ClassSpec };
  datatypes?: {};
  vars?: { [name: string]: Omit<BindingSpec, "name"> };
}
