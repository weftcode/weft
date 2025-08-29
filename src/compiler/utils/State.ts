/**
 * Generic wrapper object for stateful computations
 */
export class State<S, A> {
  constructor(readonly run: (state: S) => { state: S; value: A }) {}

  static of<S, A>(value: A): State<S, A> {
    return new State((state) => ({ state, value }));
  }

  static get<S>(): State<S, S> {
    return new State((state) => ({ state, value: state }));
  }

  static put<S>(state: S): State<S, null> {
    return new State(() => ({ state, value: null }));
  }

  static modify<S>(func: (state: S) => S) {
    return State.get<S>().bind((s) => State.put(func(s)));
  }

  static gets<S, A>(func: (state: S) => A) {
    return State.get<S>().map(func);
  }

  map<B>(func: (a: A) => B) {
    return new State<S, B>((lastState) => {
      const { state, value } = this.run(lastState);
      return { state, value: func(value) };
    });
  }

  bind<B>(func: (a: A) => State<S, B>) {
    return new State<S, B>((lastState) => {
      const { state, value } = this.run(lastState);
      return func(value).run(state);
    });
  }

  then<B>(next: State<S, B>) {
    return this.bind(() => next);
  }
}

export function mapList<S, A, B>(
  func: (a: A) => State<S, B>,
  as: A[]
): State<S, B[]> {
  if (as.length === 0) {
    return State.of([]);
  }

  let [x, ...xs] = as;

  return func(x).bind((y) =>
    mapList(func, xs).bind((ys) => State.of([y, ...ys]))
  );
}
