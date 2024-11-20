import { Scanner } from "../scan/Scanner";
import { TypeParser } from "../parse/TypeParser";
import { ErrorReporter } from "../parse/Reporter";

import { Environment, TypeConEnv } from ".";
import { TypeNode } from "../parse/AST/TypeNode";
import { makeContext, MonoType, PolyType } from "../typecheck/old/Types";
import { printType } from "../typecheck/old/Printer";
import { generalise } from "../typecheck/old/Utilities";

export type TypeEnv = {
  readonly [name: string]: Binding;
};

export type Precedence = [number, "left" | "right"];

export interface Binding {
  type: PolyType;
  value: any;
  prec?: Precedence;
}

export interface BindingSpec {
  name: string;
  type: string;
  value: any;
  prec?: Precedence;
}

export function addBinding(
  env: Environment,
  { name, type: typeString, value, prec }: BindingSpec
): Environment {
  try {
    let type = generalise(
      makeContext({}),
      validateType(parseTypeString(typeString), env.typeConEnv)
    );

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
  let reporter = new ErrorReporter();
  let tokens = new Scanner(typeString).scanTokens();
  let type = new TypeParser(tokens, reporter).parse();

  if (reporter.hasError) {
    throw new Error(`Error parsing type string: "${typeString}"`);
  }

  return type;
}

function validateType(typeNode: TypeNode, env: TypeConEnv): MonoType {
  switch (typeNode.is) {
    case TypeNode.Is.Var:
      let name = typeNode.name.lexeme;
      if (name[0] >= "a" && name[0] <= "z") {
        return { type: "ty-var", a: typeNode.name.lexeme };
      } else {
        if (typeNode.name.lexeme in env) {
          return { type: "ty-app", C: typeNode.name.lexeme, mus: [] };
        } else {
          throw new Error(`Unrecognized type: ${typeNode.name.lexeme}`);
        }
      }
    case TypeNode.Is.Group:
      return validateType(typeNode.type, env);
    case TypeNode.Is.Unit:
      return { type: "ty-app", C: "()", mus: [] };
    case TypeNode.Is.List:
      return {
        type: "ty-app",
        C: "List",
        mus: [validateType(typeNode.type, env)],
      };
    case TypeNode.Is.Tuple:
      let { items } = typeNode;
      return {
        type: "ty-app",
        C: `(${",".repeat(items.length)})`,
        mus: items.map((i) => validateType(i, env)),
      };
    case TypeNode.Is.Func:
      return {
        type: "ty-app",
        C: "->",
        mus: [
          validateType(typeNode.left, env),
          validateType(typeNode.right, env),
        ],
      };
    case TypeNode.Is.App:
      let left = validateType(typeNode.left, env);
      if (left.type !== "ty-app") {
        throw new Error(`Can't apply type: ${printType(left)}`);
      }
      return { ...left, mus: [...left.mus, validateType(typeNode.right, env)] };
    case TypeNode.Is.Qual:
      throw new Error("Qualified types aren't supported yet");
    default:
      return typeNode satisfies never;
  }
}
