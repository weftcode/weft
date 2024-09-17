import { PolyType } from "./Types";

export function printType(type: PolyType, parenthesize = false) {
  switch (type.type) {
    case "ty-var":
      return type.a;
    case "ty-app":
      if (type.mus.length === 0) {
        return type.C;
      } else if (type.C === "->") {
        return parens(
          `${printType(
            type.mus[0],
            type.mus[0].type === "ty-app" && type.mus[0].C === "->"
          )} -> ${printType(type.mus[1])}`,
          parenthesize
        );
      } else {
        return parens(
          `${type.C} ${type.mus.map((t) => printType(t, true)).join(" ")}`,
          parenthesize
        );
      }
    case "ty-quantifier":
      return parens(`forall ${type.a}. ${printType(type.sigma)}`, parenthesize);
  }
}

function parens(text: string, parenthesize: boolean) {
  return (parenthesize ? "(" : "") + text + (parenthesize ? ")" : "");
}
