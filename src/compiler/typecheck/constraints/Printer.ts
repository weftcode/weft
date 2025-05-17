import { Constraint } from "./Constraint";

import { printType } from "../Printer";

export function printConstraint({ left, right }: Constraint) {
  return `${printType(left, true)} ~ ${printType(right, true)}`;
}
