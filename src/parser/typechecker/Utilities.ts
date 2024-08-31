export type Type = MonoType;

export type MonoType =
  | { type: "Number" }
  | { type: "String" }
  | { type: "Boolean" }
  | {
      type: "Pattern";
      data: MonoType;
    }
  | { type: "List"; data: MonoType }
  | {
      type: "Function";
      arg: MonoType;
      return: MonoType;
    }
  | { type: "TypeVar"; name: string };

export namespace Types {
  export const Number = { type: "Number" } as const;
  export const String = { type: "String" } as const;
  export const Boolean = { type: "Boolean" } as const;
  export const Function = (argType: Type, returnType: Type) =>
    ({
      type: "Function",
      arg: argType,
      return: returnType,
    } as const);
  export const Operator = (left: Type, right: Type, returnType: Type) =>
    Types.Function(left, Types.Function(right, returnType));
}

export type Substitution = { [name: string]: MonoType };

function unify(
  type1: Type,
  type2: Type,
  subs: Substitution = {}
): Substitution {
  if (isEqualType(type1, type2)) {
    return subs;
  }

  if (type1.type === "TypeVar") {
    // TODO: Implement this check
    // if (contains(type2, type1)) throw new Error('Infinite type detected')

    return {
      ...subs,
      [type1.type]: type2,
    };
  }

  if (type2.type === "TypeVar") {
    return unify(type2, type1);
  }

  if (type1.type === "Function" && type2.type === "Function") {
    const subs1 = unify(type1.arg, type2.arg, subs);
    return unify(
      applySubstitution(type1.return, subs1),
      applySubstitution(type2.return, subs1),
      subs1
    );
  }

  throw new Error(
    `Cannot unify types: ${JSON.stringify(type1)} and ${JSON.stringify(type2)}`
  );
}

function isEqualType(type1: Type, type2: Type): boolean {
  if (type1.type !== type2.type) {
    return false;
  }

  if (type1.type === "Function" && type2.type === "Function") {
    return (
      isEqualType(type1.arg, type2.arg) &&
      isEqualType(type1.return, type2.return)
    );
  }

  return true;
}

function applySubstitution(type: Type, subs: Substitution): Type {
  if (type.type === "TypeVar" && subs[type.name]) {
    return subs[type.name];
  }

  if (type.type === "Function") {
    return {
      type: "Function",
      arg: applySubstitution(type.arg, subs),
      return: applySubstitution(type.return, subs),
    };
  }

  return type;
}
