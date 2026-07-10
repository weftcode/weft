import { Dashes } from "./weft.grammar.terms";

export function specializeDashes(name: string) {
  if (name === "--") {
    return Dashes;
  } else {
    return -1;
  }
}
