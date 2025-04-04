import { Kind, Type } from "../Type";
import { TypeScheme, instQualType } from "../TypeScheme";

import { Substitution, combine, applyToType } from "../Substitution";
import { mgu } from "../Unification";

type Constraint = [string, Type];

interface InferState<A> {
  num: number;
  constraints: Constraint[];
  value: A;
}

export class Inference<A> {
  static pure<A>(value: A) {
    return new Inference((constraints, num) => ({ constraints, num, value }));
  }

  static fresh() {
    return new Inference((constraints, num) => ({
      constraints,
      num: num + 1,
      value: `tv${num}`,
    }));
  }

  // static newTVar(kind: Kind) {
  //   return new Inference<Type>((sub, num) => ({
  //     sub,
  //     num: num + 1,
  //     value: { is: Type.Is.Var, id: `t${num}`, kind },
  //   }));
  // }

  static map<A, B>(func: (a: A) => Inference<B>, as: A[]): Inference<B[]> {
    if (as.length === 0) {
      return Inference.pure([]);
    }

    let [x, ...xs] = as;

    return func(x).bind((y) =>
      Inference.map(func, xs).bind((ys) => Inference.pure([y, ...ys]))
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

export function unify(t1: string, t2: Type) {
  return Inference.addConstraint([t1, t2]);
}

// export function freshInst({ forAll, qual }: TypeScheme) {
//   return Inference.map(Inference.newTVar, forAll).bind((ts) =>
//     Inference.pure(instQualType(ts, qual))
//   );
// }
