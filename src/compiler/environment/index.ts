import { TypeEnv } from "./TypeEnv";
import { TypeConEnv } from "./TypeConEnv";

export interface Environment {
  typeEnv: TypeEnv;
  typeConEnv: TypeConEnv;
  // Class Environment
}

export function makeEnv(): Environment {
  return { typeConEnv: {}, typeEnv: {} };
}

export * from "./TypeEnv";
export * from "./TypeConEnv";
