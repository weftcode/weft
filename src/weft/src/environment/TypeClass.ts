import { Predicate } from "../../../compiler/typecheck/TypeClass";
import { ClassDec, Precedence } from "../../../compiler/environment";
import { parseTypeString } from "./utils";
import { TypeNode } from "../../../compiler/parse/AST/TypeNode";
import { printQualType, printType } from "../../../compiler/typecheck/Printer";
import { Type } from "../../../compiler/typecheck/Type";
import { KType } from "../../../compiler/typecheck/BuiltIns";
import { validateSpec } from "./Type";

export interface ClassSpec {
  methods: {
    readonly [name: string]: { type: string; value?: any; prec?: Precedence };
  };
}

type InstanceDict = {
  [name: string]: any;
};

export interface InstanceSpec {
  methods:
    | { readonly [name: string]: { value: any } }
    | ((...preds: InstanceDict[]) => {
        readonly [name: string]: { value: any };
      });
}

export function validateClassSpec(
  signatureString: string,
  spec: ClassSpec
): [string, ClassDec] {
  let signature = parseTypeString(signatureString);

  let className: TypeNode.Type;
  let context: TypeNode.Context | null = null;

  // A "qualified type" is a superclass context
  if (signature.is === TypeNode.Is.Qual) {
    className = signature.type;
    context = signature.context;
  } else {
    className = signature;
  }

  if (className.is !== TypeNode.Is.App) {
    throw new Error(`Class signature "${signatureString}" is invalid.`);
  }

  let { left, right } = className;

  if (left.is !== TypeNode.Is.Const) {
    throw new Error(`Class signature must begin with a class name`);
  }

  if (right.is !== TypeNode.Is.Var) {
    throw new Error(`Class signature must end with a variable`);
  }

  let name = left.name.lexeme;
  let superClasses = context ? validateContext(context, right.name.lexeme) : [];
  let variable: Type.Var = {
    is: Type.Is.Var,
    id: right.name.lexeme,
    kind: KType,
  };

  let methods = Object.fromEntries(
    Object.entries(spec.methods).map(([name, methodSpec]) => [
      name,
      validateSpec(name, methodSpec),
    ])
  );

  return [name, { superClasses, variable, methods, instances: [] }];
}

function validateContext(context: TypeNode.Context, varName: string) {
  let assertions = context.is === TypeNode.Is.Tuple ? context.items : [context];
  return assertions.map((a) => validateAssertion(a, varName));
}

function validateAssertion(
  { left, right }: TypeNode.ClassAssertion,
  varName: string
) {
  if (left.is === TypeNode.Is.Const) {
    if (right.is !== TypeNode.Is.Var) {
      throw new Error("Expected type variable after superclass name");
    }

    if (right.name.lexeme !== varName) {
      throw new Error(`Unexpected variable "${right.name.lexeme}"`);
    }

    return left.name.lexeme;
  } else {
    return validateAssertion(left, varName);
  }
}

function validateInstance(signatureString: string, spec: InstanceSpec) {
  let signature = parseTypeString(signatureString);
}
