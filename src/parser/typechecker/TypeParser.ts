import { TokenType } from "../TokenType";
import { BaseParser } from "../BaseParser";

import { MonoType, PolyType, TypeFunction, makeContext } from "./Types";
import { generalise } from "./Utilities";

export class TypeParser extends BaseParser<PolyType> {
  parse() {
    // TODO: Check if we've reached the end
    return generalise(makeContext({}), this.functionType());
  }

  private functionType(): MonoType {
    let paramType = this.typeConstructor();

    if (this.match(TokenType.Arrow)) {
      let returnType = this.functionType();
      return { type: "ty-app", C: "->", mus: [paramType, returnType] };
    } else {
      return paramType;
    }
  }

  private typeConstructor(): MonoType {
    // If there's a type constructor
    if (this.match(TokenType.Identifier)) {
      let constructor = this.previous();
      let mus: MonoType[] = [];
      let param: MonoType;

      while ((param = this.typeTerm())) {
        mus.push(param);
      }

      return { type: "ty-app", C: constructor.lexeme as TypeFunction, mus };
    }

    // Otherwise, expect a single term
    let term = this.typeTerm();
    if (term) {
      return term;
    } else {
      throw new Error("Missing type term.");
    }
  }

  private typeTerm(): MonoType | null {
    if (this.match(TokenType.LeftBrace)) {
      let listParam = this.functionType();
      this.consume(
        TokenType.RightBrace,
        "Expected right brace at end of list type."
      );
      return { type: "ty-app", C: "List", mus: [listParam] };
    } else if (this.match(TokenType.LeftParen)) {
      // TODO: Implement
      // if (this.match(TokenType.RightParen)) {
      //   return { type: "Unit" };
      // }

      let parenContents = this.functionType();
      this.consume(
        TokenType.RightParen,
        "Expected right paren at end of parenthesized expression."
      );
      return parenContents;
    } else if (this.match(TokenType.Identifier)) {
      let identifier = this.previous();
      if (identifier.lexeme[0] >= "A" && identifier.lexeme[0] <= "Z") {
        return {
          type: "ty-app",
          C: identifier.lexeme as TypeFunction,
          mus: [],
        };
      } else {
        return {
          type: "ty-var",
          a: identifier.lexeme,
        };
      }
    }
  }
}
