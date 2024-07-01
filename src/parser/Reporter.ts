import { Token } from "./Token";
import { TokenType } from "./TokenType";

interface ErrorInfo {
  line: number;
  column: number;
  message: string;
}

export class ErrorReporter {
  private errorInfo: ErrorInfo[] = [];

  get errors() {
    return this.errorInfo.map(({ message }) => message);
  }

  get hasError() {
    return this.errorInfo.length > 0;
  }

  error(token: Token, message: string);
  error(line: number, column: number, message: string);
  error(...args: [Token, string] | [number, number, string]) {
    let line: number, column: number, message: string, where: string;

    if (args[0] instanceof Token && typeof args[1] === "string") {
      let type: TokenType, lexeme: string;
      [{ type, line, column, lexeme }, message] = args;
      where = type === TokenType.EOF ? " at end" : ` at '${lexeme}'`;
    } else if (
      typeof args[0] === "number" &&
      typeof args[1] === "number" &&
      typeof args[2] === "string"
    ) {
      [line, column, message] = args;
      where = "";
    } else {
      throw Error("Invalid error report");
    }

    message = `[${line}, ${column}] Error${where}: ${message}`;

    this.errorInfo.push({ line, column, message });
  }
}
