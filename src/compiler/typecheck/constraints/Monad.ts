import { Kind, Type } from "../Type";
import { TypeScheme, instQualType } from "../TypeScheme";

import { KType } from "../BuiltIns";

import { Constraint } from "./Constraint";

interface InferState<A> {
  num: number;
  constraints: Constraint[];
  value: A;
}

export class Inference<A> {
  static pure<A>(value: A) {
    return new Inference((constraints, num) => ({ constraints, num, value }));
  }

  static fresh(kind: Kind = KType) {
    return new Inference<Type.Var>((constraints, num) => ({
      constraints,
      num: num + 1,
      value: { is: Type.Is.Var, id: `t${num}`, kind },
    }));
  }

  static mapList<A, B>(func: (a: A) => Inference<B>, as: A[]): Inference<B[]> {
    if (as.length === 0) {
      return Inference.pure([]);
    }

    let [x, ...xs] = as;

    return func(x).bind((y) =>
      Inference.mapList(func, xs).bind((ys) => Inference.pure([y, ...ys]))
    );
  }

  static readonly getConstraints = new Inference((constraints, num) => ({
    constraints,
    num,
    value: constraints,
  }));

  static addConstraint(constraint: Constraint) {
    return new Inference((constraints, num) => ({
      constraints: [...constraints, constraint],
      num,
      value: null,
    }));
  }

  private constructor(
    readonly _run: (constraints: Constraint[], n: number) => InferState<A>
  ) {}

  map<B>(func: (a: A) => B) {
    return new Inference((constraintsA, numA) => {
      const { constraints, num, value } = this._run(constraintsA, numA);
      return { constraints, num, value: func(value) };
    });
  }

  bind<B>(func: (a: A) => Inference<B>) {
    return new Inference((subA, numA) => {
      const { constraints, num, value } = this._run(subA, numA);
      return func(value)._run(constraints, num);
    });
  }

  then<B>(next: Inference<B>) {
    return this.bind(() => next);
  }

  run() {
    return this._run([], 0).value;
  }
}

export function unify(left: Type, right: Type) {
  return Inference.addConstraint({ is: Constraint.Is.Equality, left, right });
}

export function freshInst({ forAll, qual }: TypeScheme) {
  return Inference.mapList(Inference.fresh, forAll).bind((ts) =>
    Inference.pure(instQualType(ts, qual))
  );
}
