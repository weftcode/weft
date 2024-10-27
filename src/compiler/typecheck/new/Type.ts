export type Kind = Kind.Type | Kind.Function;

export namespace Kind {
  export enum Is {
    Type = "Type Kind",
    Function = "Function Kind",
  }

  export interface Type {
    is: Is.Type;
  }

  export interface Function {
    is: Is.Function;
    left: Kind;
    right: Kind;
  }
}

export type Type = Type.Var | Type.Const | Type.App | Type.Gen;

export namespace Type {
  export enum Is {
    Var = "Type Variable",
    Const = "Type Constant",
    App = "Type Application",
    Gen = "Generic Type Variable",
  }

  export interface Var {
    is: Is.Var;
    id: string;
    kind: Kind;
  }

  export interface Const {
    is: Is.Const;
    id: string;
    kind: Kind;
  }

  export interface App {
    is: Is.App;
    left: Type;
    right: Type;
  }

  export interface Gen {
    is: Is.Gen;
    num: number;
  }
}

export function kindOf(type: Type): Kind {
  switch (type.is) {
    case Type.Is.Var:
    case Type.Is.Const:
      return type.kind;
    case Type.Is.App: {
      let k = kindOf(type.left);
      if (k.is === Kind.Is.Function) {
        return k.left;
      } else {
        throw new Error(
          "Tried to use a type with kind `Type` as a type function"
        );
      }
    }
    case Type.Is.Gen:
      throw new Error("Tried to get the kind of a generic type variable");
  }
}
