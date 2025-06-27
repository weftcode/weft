import { TokenType } from "../scan/TokenType";
import { BaseParser } from "../parse/BaseParser";

import { TypeNode } from "./AST/TypeNode";

export class TypeParser extends BaseParser<TypeNode> {
  parse() {
    // TODO: Check if we've reached the end
    return this.qualifiedType();
  }

  private qualifiedType(): TypeNode {
    let context = this.functionType();

    if (this.match(TokenType.DoubleArrow)) {
      // We found a type constraint! For now, let's not try re-parsing it
      return {
        is: TypeNode.Is.Qual,
        context,
        type: this.functionType(),
      };
    } else {
      return context;
    }
  }

  private functionType(): TypeNode.Type {
    let left = this.typeApplication();

    if (this.match(TokenType.Arrow)) {
      let right = this.functionType();
      return { is: TypeNode.Is.Func, left, right };
    } else {
      return left;
    }
  }

  private typeApplication(): TypeNode.Type {
    // If there's a type function identifier
    let left = this.typeTerm();

    if (!left) {
      throw new Error("Missing type term.");
    }

    let right: TypeNode.Type | null;

    while ((right = this.typeTerm())) {
      left = { is: TypeNode.Is.App, left, right };
    }

    return left;
  }

  private typeTerm(): TypeNode.Type | null {
    if (this.match(TokenType.LeftBracket)) {
      let type = this.functionType();
      this.consume(
        TokenType.RightBracket,
        "Expected right bracket at end of list type."
      );
      return { is: TypeNode.Is.List, type };
    } else if (this.match(TokenType.LeftParen)) {
      let items: TypeNode.Type[] = [];

      while (!this.match(TokenType.RightParen)) {
        if (this.isAtEnd()) {
          // TODO: Maybe specialize this to different possibilities
          throw new Error("Unterminated tuple type");
        }

        if (items.length > 0) {
          this.consume(TokenType.Comma, "Expect ',' after tuple item");
        }

        items.push(this.functionType());
      }

      switch (items.length) {
        case 0:
          return { is: TypeNode.Is.Unit };
        case 1:
          return { is: TypeNode.Is.Group, type: items[0] };
        default:
          return { is: TypeNode.Is.Tuple, items };
      }
    } else {
      return this.typeIdentifier();
    }
  }

  private typeIdentifier(): TypeNode.Type | null {
    if (this.match(TokenType.Identifier)) {
      let name = this.previous();

      return {
        is: TypeNode.Is.Var,
        name,
      };
    }

    return null;
  }
}
