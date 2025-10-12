import { Environment } from "../../../compiler/environment";

import { Scanner } from "../../../compiler/scan/Scanner";
import { TypeParser } from "../../../compiler/parse/TypeParser";
import { TypeNode } from "../../../compiler/parse/AST/TypeNode";

import { Type, Kind } from "../../../compiler/typecheck/Type";
import { QualType, Predicate } from "../../../compiler/typecheck/TypeClass";

import {
  KFunc,
  KType,
  TFunc,
  tList,
  TTuple,
  tUnit,
} from "../../../compiler/typecheck/BuiltIns";

export function parseTypeString(typeString: string) {
  let tokens = new Scanner(typeString).scanTokens();
  let type = new TypeParser(tokens).parse();

  return type;
}

export function validateQualType(typeNode: TypeNode): QualType {
  if (typeNode.is === TypeNode.Is.Qual) {
    let { context, type } = typeNode;
    let preds = context.is === TypeNode.Is.Tuple ? context.items : [context];
    return {
      preds: preds.map((p) => validatePredicate(p)),
      type: validateType(type),
    };
  } else {
    return {
      preds: [],
      type: validateType(typeNode),
    };
  }
}

function validatePredicate(predNode: TypeNode.ClassAssertion): Predicate {
  if (predNode.left.is === TypeNode.Is.Const) {
    // TODO: Check that class exists
    return {
      isIn: predNode.left.name.lexeme,
      type: validateType(predNode.right),
    };
  } else {
    let { left, right } = predNode;
    let { isIn, type } = validatePredicate(left);

    return {
      isIn,
      type: {
        is: Type.Is.App,
        left: type,
        right: validateType(right),
      },
    };
  }
}

function validateType(typeNode: TypeNode.Type, kind: Kind = KType): Type {
  switch (typeNode.is) {
    case TypeNode.Is.Var:
      return { is: Type.Is.Var, id: typeNode.name.lexeme, kind };
    case TypeNode.Is.Const:
      return { is: Type.Is.Const, id: typeNode.name.lexeme, kind };
    case TypeNode.Is.Group:
      return validateType(typeNode.type, kind);
    case TypeNode.Is.Unit:
      // TODO: Kind check
      return tUnit;
    case TypeNode.Is.List:
      // TODO: Kind check
      return {
        is: Type.Is.App,
        left: tList,
        right: validateType(typeNode.type),
      };
    case TypeNode.Is.Tuple: {
      // TODO: Kind check
      let { items } = typeNode;
      let left: Type = TTuple(items.length);
      for (let item of items) {
        left = { is: Type.Is.App, left, right: validateType(item) };
      }
      return left;
    }
    case TypeNode.Is.Func:
      // TODO: Kind check
      return TFunc(validateType(typeNode.left), validateType(typeNode.right));
    case TypeNode.Is.App:
      return {
        is: Type.Is.App,
        left: validateType(typeNode.left, KFunc(KType, kind)),
        right: validateType(typeNode.right),
      };
    default:
      return typeNode satisfies never;
  }
}
