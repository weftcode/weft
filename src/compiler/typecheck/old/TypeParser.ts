import { TokenType } from "../../scan/TokenType";
import { BaseParser } from "../../parse/BaseParser";

import { MonoType, PolyType, makeContext } from "./Types";
import { generalise } from "./Utilities";

export class TypeParser extends BaseParser<PolyType> {
  parse() {
    // TODO: Check if we've reached the end
    return generalise(makeContext({}), this.functionType());
  }

  private functionType(): MonoType {
    let paramType = this.typeConstructor();

    if (this.match(TokenType.DoubleArrow)) {
      // We found a type constraint! For now, let's just discard it
      return this.functionType();
    } else if (this.match(TokenType.Arrow)) {
      let returnType = this.functionType();
      return {
        type: "ty-app",
        C: "->",
        mus: [paramType, returnType],
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
        let param: MonoType | null;

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
      return { type: "ty-app", C: "List", mus: [listParam] };
    } else if (this.match(TokenType.LeftParen)) {
      let elements: MonoType[] = [];

      while (!this.match(TokenType.RightParen)) {
        if (this.isAtEnd()) {
          throw new Error("Unterminated tuple type");
        }

        if (elements.length > 0) {
          this.consume(TokenType.Comma, "Expect ',' after tuple item");
        }

        elements.push(this.functionType());
      }

      return elements.length === 1
        ? elements[0]
        : { type: "ty-app", C: "()", mus: elements };
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
        };
      } else {
        return {
          type: "ty-var",
          a: identifier.lexeme,
        };
      }
    }

    return null;
  }
}
