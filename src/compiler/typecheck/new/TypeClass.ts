import { Type } from "./Type";

export interface Predicate {
  isIn: string;
  type: Type;
}

export interface QualType {
  preds: Predicate[];
  type: Type;
}

export interface Instance {
  preds: Predicate[];
  inst: Predicate;
}
