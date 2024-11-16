import { Token } from "../../scan/Token";

export type TypeNode = TypeNode.Qual | TypeNode.Type;

export namespace TypeNode {
  export enum Is {
    Qual = "Qualified",
    Func = "Function",
    App = "Application",
    List = "List",
    Tuple = "Tuple",
    Group = "Grouping",
    Var = "Variable",
    Const = "Constructor",
    Unit = "Unit",
  }

  export interface Qual {
    is: Is.Qual;
    context: Context;
    type: Type;
  }

  interface HNFPred extends App {
    left: Const;
    right: Var;
  }

  interface HNFApp extends App {
    left: HNFPred | HNFApp;
  }

  export type ClassAssertion = HNFPred | HNFApp;

  export interface ClassAssertionList extends Tuple {
    items: ClassAssertion[];
  }

  export type Context = ClassAssertion | ClassAssertionList;

  export type Type = Func | App | List | Tuple | Group | Var | Const | Unit;

  export interface Func {
    is: Is.Func;
    left: Type;
    right: Type;
  }

  export interface App {
    is: Is.App;
    left: Type;
    right: Type;
  }

  export interface List {
    is: Is.List;
    type: Type;
  }

  export interface Tuple {
    is: Is.Tuple;
    items: Type[];
  }

  export interface Group {
    is: Is.Group;
    type: Type;
  }

  export interface Const {
    is: Is.Const;
    name: Token;
  }

  export interface Var {
    is: Is.Var;
    name: Token;
  }

  export interface Unit {
    is: Is.Unit;
  }
}
