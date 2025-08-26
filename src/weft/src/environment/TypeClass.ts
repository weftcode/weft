import { Predicate } from "../../../compiler/typecheck/TypeClass";
import { Precedence } from "../../../compiler/environment";

export interface ClassSpec {
  variable: string;
  superClasses: string[];
  methods: {
    readonly [name: string]: { type: string; value?: any; prec?: Precedence };
  };
  instances?: InstanceSpec[];
}

export interface InstanceSpec {
  preds: Predicate[];
  inst: Predicate;
  methods: { readonly [name: string]: { value: any } };
}
