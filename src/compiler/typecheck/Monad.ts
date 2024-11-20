import { Kind, Type } from "./Type";
import { TypeScheme, instQualType } from "./TypeScheme";

import { Substitution, combine, applyToType } from "./Substitution";
import { mgu } from "./Unification";

interface TypeInfState<A> {
  sub: Substitution;
  num: number;
  value: A;
}

export class TypeInf<A> {
  static pure<A>(value: A) {
    return new TypeInf((sub, num) => ({ sub, num, value }));
  }

  static newTVar(kind: Kind) {
    return new TypeInf<Type>((sub, num) => ({
      sub,
      num: num + 1,
      value: { is: Type.Is.Var, id: `t${num}`, kind },
    }));
  }

  static map<A, B>(func: (a: A) => TypeInf<B>, as: A[]): TypeInf<B[]> {
    if (as.length === 0) {
      return TypeInf.pure([]);
    }

    let [x, ...xs] = as;

    return func(x).bind((y) =>
      TypeInf.map(func, xs).bind((ys) => TypeInf.pure([y, ...ys]))
    );
  }

  static readonly getSub = new TypeInf((sub, num) => ({
    sub,
    num,
    value: sub,
  }));

  static extendSub(s2: Substitution) {
    return new TypeInf((s1, num) => ({
      sub: combine(s1, s2),
      num,
      value: null,
    }));
  }

  private constructor(
    readonly _run: (sub: Substitution, n: number) => TypeInfState<A>
  ) {}

  bind<B>(func: (a: A) => TypeInf<B>) {
    return new TypeInf((subA, numA) => {
      const { sub, num, value } = this._run(subA, numA);
      return func(value)._run(sub, num);
    });
  }

  then<B>(next: TypeInf<B>) {
    return this.bind(() => next);
  }

  run() {
    return this._run({}, 0).value;
  }
}

export function unify(t1: Type, t2: Type) {
  return TypeInf.getSub.bind((s) =>
    TypeInf.extendSub(mgu(applyToType(s, t1), applyToType(s, t2)))
  );
}

export function freshInst({ forAll, qual }: TypeScheme) {
  return TypeInf.map(TypeInf.newTVar, forAll).bind((ts) =>
    TypeInf.pure(instQualType(ts, qual))
  );
}
