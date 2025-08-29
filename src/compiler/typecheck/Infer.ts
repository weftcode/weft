import { Kind, Type } from "./Type";
import { TypeScheme, instQualType } from "./TypeScheme";

import { KType } from "./BuiltIns";

import { Constraint } from "./Constraint";

import { Expr } from "../parse/AST/Expr";
import { TypeExt } from "./ASTExtensions";

import { State, mapList } from "../utils/State";

interface InferState {
  num: number;
  constraints: Constraint[];
}

export type Infer<A> = State<InferState, A>;

export namespace Infer {
  export function of<A>(value: A): Infer<A> {
    return State.of(value);
  }

  export function fresh(kind: Kind = KType): Infer<Type.Var> {
    return State.get<InferState>().bind(({ constraints, num }) =>
      State.put({ constraints, num: num + 1 }).then(
        State.of({ is: Type.Is.Var, id: `t${num}`, kind })
      )
    );
  }

  export function getConstraints(): Infer<Constraint[]> {
    return State.gets(({ constraints }) => constraints);
  }

  export function addConstraint(constraint: Constraint): Infer<null> {
    return State.modify(({ constraints, num }) => ({
      constraints: [...constraints, constraint],
      num,
    }));
  }

  export function unify(left: Type, right: Type, source: Expr<TypeExt>) {
    return addConstraint({
      is: Constraint.Is.Equality,
      left,
      right,
      source,
    });
  }

  export function freshInst({ forAll, qual }: TypeScheme) {
    return mapList(fresh, forAll).bind((ts) =>
      State.of(instQualType(ts, qual))
    );
  }
}
