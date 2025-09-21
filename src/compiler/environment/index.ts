import { TypeEnv } from "./TypeEnv";
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

export function listBindingNames(env: Environment) {
  return Object.keys(env.typeEnv);
}

export * from "./TypeEnv";
export * from "./TypeConEnv";
export * from "./TypeClassEnv";
