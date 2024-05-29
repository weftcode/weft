import { Token } from "./Token";
import { TokenType } from "./TokenType";

export type ErrorReporter = ((line: number, message: string) => void) &
  ((token: Token, message: string) => void);

let hadError = false;

export function error(line: number, message: string): void;
export function error(token: Token, message: string): void;
export function error(lineOrToken: number | Token, message: string) {
  if (typeof lineOrToken === "number") {
    const line = lineOrToken;
    report(line, "", message);
  } else {
    const { type, line, lexeme } = lineOrToken;
    if (type == TokenType.EOF) {
      report(line, " at end", message);
    } else {
      report(line, ` at '${lexeme}'`, message);
    }
  }
}

// export function runtimeError(error: RuntimeError) {
//   console.error(`${error.message}\n[line ${error.token.line}]`);
//   hadRuntimeError = true;
// }

function report(line: number, where: string, message: string) {
  console.error(`[line ${line}] Error${where}: ${message}`);
  hadError = true;
}

export function wasError() {
  return hadError;
}
