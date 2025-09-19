import fc from "fast-check";

import { Type, Kind } from "../Type";
import { KType } from "../BuiltIns";

type LetRecOf<T extends { is: string }, Root extends keyof any = "main"> = {
  [K in T["is"]]: T & { is: K };
} & Record<Root, T>;

export const { arbitraryKind } = fc.letrec<LetRecOf<Kind, "arbitraryKind">>(
  (tie) => ({
    arbitraryKind: fc.oneof(tie(Kind.Is.Type), tie(Kind.Is.Function)),
    [Kind.Is.Type]: fc.constant(KType),
    [Kind.Is.Function]: fc.record({
      is: fc.constant(Kind.Is.Function),
      left: tie("arbitraryKind"),
      right: tie("arbitraryKind"),
    }),
  })
);

export const { type } = fc.letrec<LetRecOf<Type, "type">>((tie) => ({
  type: fc.oneof(
    tie(Type.Is.Var),
    tie(Type.Is.App),
    tie(Type.Is.Const),
    tie(Type.Is.Gen)
  ),
  [Type.Is.Var]: fc.record({
    is: fc.constant(Type.Is.Var),
    id: fc.stringMatching(/^[a-z]+$/),
    kind: arbitraryKind,
  }),
  [Type.Is.Const]: fc.record({
    is: fc.constant(Type.Is.Const),
    id: fc.stringMatching(/^[A-Z][a-zA-Z]*$/),
    kind: arbitraryKind,
  }),
  [Type.Is.Gen]: fc.record({
    is: fc.constant(Type.Is.Gen),
    num: fc.nat(),
  }),
  [Type.Is.App]: fc.record({
    is: fc.constant(Type.Is.App),
    left: tie("type"),
    right: tie("type"),
  }),
}));
