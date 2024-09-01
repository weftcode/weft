import { TokenType } from "../TokenType";
import { BaseParser } from "../BaseParser";

import { Type } from "./Utilities";

export class TypeParser extends BaseParser<Type> {
  parse() {
    // TODO: Check if we've reached the end
    return this.functionType();
  }

  private functionType(): Type {
    let paramType = this.typeConstructor();

    if (this.match(TokenType.Arrow)) {
      let returnType = this.functionType();
      return { type: "Function", arg: paramType, return: returnType };
    } else {
      return paramType;
    }
  }

  private typeConstructor(): Type {
    // If there's a type constructor
    if (this.match(TokenType.Identifier)) {
      let constructor = this.previous();
      let params: Type[] = [];
      let param: Type;

      while ((param = this.typeTerm())) {
        params.push(param);
      }

      return { type: "TypeCon", name: constructor.lexeme, params };
    }

    // Otherwise, expect a single term
    let term = this.typeTerm();
    if (term) {
      return term;
    } else {
      throw new Error("Missing type term.");
    }
  }

  private typeTerm(): Type | null {
    if (this.match(TokenType.LeftBrace)) {
      let listParam = this.functionType();
      this.consume(
        TokenType.RightBrace,
        "Expected right brace at end of list type."
      );
      return { type: "TypeCon", name: "List", params: [listParam] };
    } else if (this.match(TokenType.LeftParen)) {
      if (this.match(TokenType.RightParen)) {
        return { type: "Unit" };
      }

      let parenContents = this.functionType();
      this.consume(
        TokenType.RightParen,
        "Expected right paren at end of parenthesized expression."
      );
      return parenContents;
    } else if (this.match(TokenType.Identifier)) {
      let identifier = this.previous();
      return { type: "TypeCon", name: identifier.lexeme, params: [] };
    }
  }
}
