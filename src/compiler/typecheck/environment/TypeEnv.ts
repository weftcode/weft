import { Scanner } from "../../scan/Scanner";
import { TypeParser } from "../../parse/TypeParser";

import { Environment, TypeConEnv } from ".";
import { TypeNode } from "../../parse/AST/TypeNode";
import { Kind, Type } from "../Type";
import { Predicate, QualType } from "../TypeClass";
import { quantify, TypeScheme } from "../TypeScheme";
import { KFunc, KType, TFunc, tList, TTuple, tUnit } from "../BuiltIns";

export type TypeEnv = {
  readonly [name: string]: Binding;
};

export type Precedence = [number, "left" | "right"];

export interface Binding {
  type: TypeScheme;
  value: any;
  prec?: Precedence;
}

export type BindingSpec = Omit<Binding, "type"> & {
  name: string;
  type: string;
};

export function addBinding(
  env: Environment,
  { name, type: typeString, value, prec }: BindingSpec
): Environment {
  try {
    let type = quantify([], validateQualType(parseTypeString(typeString), env));

    return {
      ...env,
      typeEnv: { ...env.typeEnv, [name]: { type, value, prec } },
    };
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Error with "${name}" binding: ${e.message}`);
    } else {
      throw e;
    }
  }
}

function parseTypeString(typeString: string) {
  let tokens = new Scanner(typeString).scanTokens();
  let type = new TypeParser(tokens).parse();

  // if (reporter.hasError) {
  //   throw new Error(`Error parsing type string: "${typeString}"`);
  // }

  return type;
}

function validateQualType(typeNode: TypeNode, env: Environment): QualType {
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
