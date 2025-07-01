import { TypeEnv } from "./TypeEnv";
import { TypeConEnv } from "../../environment/TypeConEnv";
import { TypeClassEnv } from "./TypeClassEnv";

export interface Environment {
  typeEnv: TypeEnv;
  typeConEnv: TypeConEnv;
  typeClassEnv: TypeClassEnv;
}

export function makeEnv(): Environment {
  return { typeConEnv: {}, typeEnv: {}, typeClassEnv: {} };
}

export * from "./TypeEnv";
export * from "../../environment/TypeConEnv";
export * from "./TypeClassEnv";
