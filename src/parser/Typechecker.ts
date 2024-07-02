import { Expr } from "./Expr";
import { Stmt } from "./Stmt";
import { Environment } from "./Environment";
import { ErrorReporter } from "./Reporter";

enum TypeTypes {
  Number,
  String,
  Pattern,
  Function,
  List,
}

type Type =
  | {
      type: TypeTypes.Number;
    }
  | {
      type: TypeTypes.String;
    }
  | {
      type: TypeTypes.Pattern;
      data: Type;
    }
  | { type: TypeTypes.List; data: Type }
  | {
      type: TypeTypes.Function;
      arg: Type;
      return: Type;
    };

export class TypeChecker {
  constructor(
    private readonly reporter: ErrorReporter,
    private environment: Environment<Type>
  ) {}

  check(statements: Stmt[]) {}
}
