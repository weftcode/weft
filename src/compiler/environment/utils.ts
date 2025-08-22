import { Environment } from ".";
import { TypeConEnv } from ".";

import { Scanner } from "../scan/Scanner";
import { TypeParser } from "../parse/TypeParser";
import { TypeNode } from "../parse/AST/TypeNode";

import { Type, Kind } from "../typecheck/Type";
import { QualType, Predicate } from "../typecheck/TypeClass";

import {
  KFunc,
  KType,
  TFunc,
  tList,
  TTuple,
  tUnit,
} from "../typecheck/BuiltIns";

export function parseTypeString(typeString: string) {
  let tokens = new Scanner(typeString).scanTokens();
  let type = new TypeParser(tokens).parse();

  return type;
}

export function validateQualType(
  typeNode: TypeNode,
  env: Environment
): QualType {
  if (typeNode.is === TypeNode.Is.Qual) {
    let { context, type } = typeNode;
    let preds = context.is === TypeNode.Is.Tuple ? context.items : [context];
    return {
      preds: preds.map((p) => validatePredicate(p, env)),
      type: validateType(type, env.typeConEnv),
    };
  } else {
    return {
      preds: [],
      type: validateType(typeNode, env.typeConEnv),
    };
  }
}

function validatePredicate(
  predNode: TypeNode.ClassAssertion,
  env: Environment
): Predicate {
  if (predNode.left.is === TypeNode.Is.Const) {
    // TODO: Check that class exists
    return {
      isIn: predNode.left.name.lexeme,
      type: validateType(predNode.right, env.typeConEnv),
    };
  } else {
    let { left, right } = predNode;
    let { isIn, type } = validatePredicate(left, env);

    return {
      isIn,
      type: {
        is: Type.Is.App,
        left: type,
        right: validateType(right, env.typeConEnv),
      },
    };
  }
}

function validateType(
  typeNode: TypeNode.Type,
  env: TypeConEnv,
  kind: Kind = KType
): Type {
  switch (typeNode.is) {
    case TypeNode.Is.Var:
      return { is: Type.Is.Var, id: typeNode.name.lexeme, kind };
    case TypeNode.Is.Const:
      if (typeNode.name.lexeme in env) {
        // TODO: Check kind against data type declaration
        return { is: Type.Is.Const, id: typeNode.name.lexeme, kind };
      } else {
        throw new Error(`Unrecognized type: ${typeNode.name.lexeme}`);
      }
    case TypeNode.Is.Group:
      return validateType(typeNode.type, env, kind);
    case TypeNode.Is.Unit:
      // TODO: Kind check
      return tUnit;
    case TypeNode.Is.List:
      // TODO: Kind check
      return {
        is: Type.Is.App,
        left: tList,
        right: validateType(typeNode.type, env),
      };
    case TypeNode.Is.Tuple: {
      // TODO: Kind check
      let { items } = typeNode;
      let left: Type = TTuple(items.length);
      for (let item of items) {
        left = { is: Type.Is.App, left, right: validateType(item, env) };
      }
      return left;
    }
    case TypeNode.Is.Func:
      // TODO: Kind check
      return TFunc(
        validateType(typeNode.left, env),
        validateType(typeNode.right, env)
      );
    case TypeNode.Is.App:
      return {
        is: Type.Is.App,
        left: validateType(typeNode.left, env, KFunc(KType, kind)),
        right: validateType(typeNode.right, env),
      };
    default:
      return typeNode satisfies never;
  }
}
