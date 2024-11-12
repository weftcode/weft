import { Environment } from ".";

export type TypeConEnv = {
  readonly [name: string]: TypeCon;
};

export interface TypeCon {
  // Kind
  dataCons: DataCon[];
}

export interface DataCon {
  name: string;
  // type: PolyType;
}

export interface TypeConSpec {
  name: string;
  dataCons: DataCon[];
}

export function addDataType(
  env: Environment,
  { name, ...spec }: TypeConSpec
): Environment {
  return { ...env, typeConEnv: { ...env.typeConEnv, [name]: spec } };
}
