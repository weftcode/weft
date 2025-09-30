import { Kind } from "../typecheck/Type";

import { Environment } from "../environment";
import { TypeScheme } from "../typecheck/TypeScheme";

import { parseTypeString, validateQualType } from "./utils";
import { quantify } from "../typecheck/TypeScheme";

export type TypeConEnv = {
  readonly [name: string]: TypeCon;
};

export interface TypeCon {
  kind: Kind;
  dataCons: DataCon[];
}

export interface DataCon {
  name: string;
  type: TypeScheme;
  value: any;
}

export type TypeConSpec = Omit<TypeCon, "dataCons"> & {
  name: string;
  dataCons: DataConSpec[];
};

export type DataConSpec = Omit<DataCon, "type"> & {
  type: string;
};

export function addDataType(
  env: Environment,
  name: string,
  typeCon: TypeCon
): Environment {
  // TODO: Some sorts of validation?
  // This is hacky, but in order to validate the correct type of the constructors, we
  // need to pretend like the type constructor has been added to the type environment
  // let dummyEnv = {
  //   ...env,
  //   typeConEnv: { ...env.typeConEnv, [name]: { kind, dataCons: [] } },
  // };

  // let dataCons = dataConSpecs.map(({ type: typeString, ...spec }) => {
  //   let type = quantify(
  //     [],
  //     validateQualType(parseTypeString(typeString), dummyEnv)
  //   );

  //   return { type, ...spec };
  // });

  return {
    ...env,
    typeConEnv: { ...env.typeConEnv, [name]: typeCon },
  };
}
