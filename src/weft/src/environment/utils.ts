import { Scanner } from "../../../compiler/scan/Scanner";
import { Parser } from "../../../compiler/parse/Parser";

export function parseTypeString(typeString: string) {
  let tokens = new Scanner(typeString).scanTokens();
  let type = new Parser(tokens, {}).qualifiedType();

  return type;
}
