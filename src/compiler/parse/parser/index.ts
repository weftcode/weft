import { CstParser } from "chevrotain";

import { tokens } from "../lexer";
import * as Token from "../lexer";

export class WeftParser extends CstParser {
  constructor() {
    super(tokens);
    this.performSelfAnalysis();
  }

  program = this.RULE("program", () => {
    this.MANY(() => {
      this.SUBRULE(this.statement);
    });
  });

  statement = this.RULE("statement", () => {
    this.OR([{ ALT: () => this.SUBRULE(this.letStmt) }]);
  });

  letStmt = this.RULE("letStmt", () => {
    this.CONSUME(Token.Let);
    this.AT_LEAST_ONE(() => this.dec);
  });

  dec = this.RULE("dec", () => {
    this.CONSUME(Token.VarId);
    this.CONSUME(Token.Equal);
    this.SUBRULE(this.expression);
  });

  // Expressions
  expression = this.RULE("expression", () => {
    this.OR([]);
  });
}
