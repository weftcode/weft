import { TokenType } from "../TokenType";
import { BaseParser } from "../BaseParser";

import { MonoType, PolyType, makeContext } from "./Types";
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
      return {
        type: "ty-app",
        C: "->",
        mus: [paramType, returnType],
        source: null,
      };
    } else {
      return paramType;
    }
  }

  private typeConstructor(): MonoType {
    // If there's a type function identifier
    let constructor = this.typeIdentifier();

    if (constructor !== null) {
      if (constructor.type === "ty-app") {
        let mus: MonoType[] = [];
        let param: MonoType;

        while ((param = this.typeTerm())) {
          mus.push(param);
        }

        return { ...constructor, mus };
      } else {
        return constructor;
      }
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
    if (this.match(TokenType.LeftBracket)) {
      let listParam = this.functionType();
      this.consume(
        TokenType.RightBracket,
        "Expected right bracket at end of list type."
      );
      return { type: "ty-app", C: "List", mus: [listParam], source: null };
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
    } else {
      return this.typeIdentifier();
    }
  }

  private typeIdentifier(): MonoType | null {
    if (this.match(TokenType.Identifier)) {
      let identifier = this.previous();
      if (identifier.lexeme[0] >= "A" && identifier.lexeme[0] <= "Z") {
        return {
          type: "ty-app",
          C: identifier.lexeme,
          mus: [],
          source: null,
        };
      } else {
        return {
          type: "ty-var",
          a: identifier.lexeme,
          source: null,
        };
      }
    }

    return null;
  }
}
