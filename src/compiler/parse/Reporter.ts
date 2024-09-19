import { Token } from "../scan/Token";
import { TokenType } from "../scan/TokenType";

interface ErrorInfo {
  from: number;
  to: number;
  message: string;
}

export class ErrorReporter {
  private errorInfo: ErrorInfo[] = [];

  get errors() {
    return this.errorInfo;
  }

  get hasError() {
    return this.errorInfo.length > 0;
  }

  error(token: Token, message: string);
  error(from: number, to: number, message: string);
  error(...args: [Token, string] | [number, number, string]) {
    let from: number, to: number, message: string;

    if (args[0] instanceof Token && typeof args[1] === "string") {
      [{ from, to }, message] = args;
    } else if (
      typeof args[0] === "number" &&
      typeof args[1] === "number" &&
      typeof args[2] === "string"
    ) {
      [from, to, message] = args;
    } else {
      throw Error("Invalid error report");
    }

    this.errorInfo.push({ from, to, message });
  }
}
