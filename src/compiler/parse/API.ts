import { TokenType } from "../scan/TokenType";

// Tuple of precedence and associativity
export type Precedence = [number, "left" | "right"];
export type Operators = Map<TokenType, Precedence>;

export type IDBinding = { type: string; value: any; synonyms?: string[] };
export type OperatorBinding = {
  token: TokenType;
  type: string;
  value: any;
  synonyms?: string[];
  prec: Precedence;
};

export type Bindings = {
  [name: string]: IDBinding | OperatorBinding;
};

export function expandSynonyms(bindings: Bindings) {
  let expansions: Bindings = {};

  for (let { synonyms, ...binding } of Object.values(bindings)) {
    synonyms?.forEach((synonym) => {
      expansions[synonym] = { ...binding };
    });
  }

  return { ...bindings, ...expansions };
}

export function getOperators(bindings: Bindings) {
  let operators: Operators = new Map();

  for (let value of Object.values(bindings)) {
    if ("token" in value) {
      let { token, prec } = value;

      operators.set(token, prec);
    }
  }

  return operators;
}
