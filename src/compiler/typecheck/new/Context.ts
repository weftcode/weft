import { Type } from "./Type";
import { TypeScheme } from "./TypeScheme";

export type TypeEnv = { [id: string]: TypeScheme };

export type TypeConstEnv = { [id: string]: Type.Const };
