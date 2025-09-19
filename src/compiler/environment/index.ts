import { TypeEnv, Binding } from "./TypeEnv";
import { TypeConEnv } from "./TypeConEnv";
import { TypeClassEnv } from "./TypeClassEnv";

export interface Environment {
  typeEnv: TypeEnv;
  typeConEnv: TypeConEnv;
  typeClassEnv: TypeClassEnv;
}

export function makeEnv(): Environment {
  return { typeConEnv: {}, typeEnv: {}, typeClassEnv: {} };
}

export function getBinding(
  env: Environment,
  name: string
): Binding | undefined {
  let { typeEnv, typeClassEnv, typeConEnv } = env;

  // First, check if name is bound in type environment
  if (name in typeEnv) return typeEnv[name];

  // Then check if name is bound as a type class method
  for (let { methods } of Object.values(typeClassEnv)) {
    if (name in methods) return methods[name];
  }

  // Then check if name is bound as a data constructor
  for (let { dataCons } of Object.values(typeConEnv)) {
    for (let { name: dataConName, ...dataCon } of dataCons) {
      if (dataConName === name) return dataCon;
    }
  }

  return undefined;
}

export * from "./TypeEnv";
export * from "./TypeConEnv";
export * from "./TypeClassEnv";
