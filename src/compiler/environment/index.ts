import { TypeEnv } from "./TypeEnv";
import { TypeConEnv } from "./TypeConEnv";

export interface Environment {
  typeEnv: TypeEnv;
  typeConEnv: TypeConEnv;
  // Class Environment
}

export * from "./TypeEnv";
export * from "./TypeConEnv";
