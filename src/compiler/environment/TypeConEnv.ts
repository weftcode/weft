import { Kind } from "../typecheck/Type";

import { Environment } from "../environment";

export type TypeConEnv = {
  readonly [name: string]: TypeCon;
};

export interface TypeCon {
  kind: Kind;
  dataCons: DataCon[];
}

export interface DataCon {
  name: string;
  // type: PolyType;
}

export type TypeConSpec = TypeCon & {
  name: string;
  kind: Kind;
  dataCons: DataCon[];
};

export function addDataType(
  env: Environment,
  { name, ...spec }: TypeConSpec
): Environment {
  return { ...env, typeConEnv: { ...env.typeConEnv, [name]: spec } };
}
