import { TokenType } from "../scan/TokenType";
import { State } from "../utils/State";
import { TypeNode } from "./AST/TypeNode";

import { Parse } from "./Parse";

// Type Nodes
export function qualifiedType(): Parse<TypeNode> {
  return functionType().bind((maybeContext) =>
    Parse.match(TokenType.DoubleArrow).bind((isQualified) =>
      isQualified
        ? functionType().map<TypeNode>((type) => ({
            is: TypeNode.Is.Qual,
            context: asContext(maybeContext),
            type,
          }))
        : State.of(maybeContext)
    )
  );
}

function asContext(node: TypeNode.Type): TypeNode.Context {
  if (node.is === TypeNode.Is.Tuple) {
    return {
      ...node,
      items: node.items.map((item) => asClassAssertion(item)),
    };
  } else {
    return asClassAssertion(node);
  }
}

function asClassAssertion(node: TypeNode.Type): TypeNode.ClassAssertion {
  if (node.is !== TypeNode.Is.App) {
    throw new Error(`Class assertion can't be of form: ${node.is}`);
  }

  const { left, right } = node;

  if (left.is === TypeNode.Is.Const) {
    if (right.is !== TypeNode.Is.Var) {
      throw new Error(`Class assertion must be in head-normal form`);
    }

    return { ...node, left, right };
  } else {
    return { ...node, left: asClassAssertion(left) };
  }
}

function functionType(): Parse<TypeNode.Type> {
  return typeApplication().bind((left) =>
    Parse.match(TokenType.Arrow).bind((hasArrow) =>
      hasArrow
        ? functionType().map((right) => ({
            is: TypeNode.Is.Func,
            left,
            right,
          }))
        : State.of(left)
    )
  );
}

function typeApplication(): Parse<TypeNode.Type> {
  // If there's a type function identifier
  return typeTerm().bind((left) => {
    if (!left) {
      throw new Error("Missing type term.");
    }

    return;
  });

  let right: TypeNode.Type | null;

  while ((right = this.typeTerm())) {
    left = { is: TypeNode.Is.App, left, right };
  }

  return left;
}

function typeTermList(): Parse<TypeNode[]> {
  return typeTerm().bind(term => {
    ?? [];
  })
}

function typeTerm(): Parse<TypeNode.Type | null> {
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

function typeIdentifier(): TypeNode.Type | null {
  if (this.match(TokenType.Identifier)) {
    let name = this.previous();
    let { lexeme } = name;

    if (lexeme[0] >= "a" && lexeme[0] <= "z") {
      return { is: TypeNode.Is.Var, name };
    } else if (lexeme[0] >= "A" && lexeme[0] <= "Z") {
      return { is: TypeNode.Is.Const, name };
    }
  }

  return null;
}
