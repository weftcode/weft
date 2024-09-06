// Types

// mu ::= a
//      | C mu_0 ... mu_n

// sigma ::= mu
//         | Va. sigma

export type MonoType = TypeVariable | TypeFunctionApplication;

export type PolyType = MonoType | TypeQuantifier;

export interface TypeVariable {
  type: "ty-var";
  a: string;
}

export interface TypeFunctionApplication {
  type: "ty-app";
  C: string;
  mus: MonoType[];
}

export interface TypeQuantifier {
  type: "ty-quantifier";
  a: string;
  sigma: PolyType;
}

// Contexts

export const ContextMarker = Symbol();
export type Context = {
  [ContextMarker]: boolean;
  [variable: string]: PolyType;
};

export const makeContext = (raw: {
  [ContextMarker]?: boolean;
  [variable: string]: PolyType;
}): Context => {
  raw[ContextMarker] = true;
  return raw as Context;
};

export const isContext = (something: unknown): something is Context => {
  return (
    typeof something === "object" &&
    something !== null &&
    ContextMarker in something
  );
};
