import fc from "fast-check";

import { Type, Kind } from "../Type";
import { KType } from "../BuiltIns";

export const { kind: arbitraryKind } = fc.letrec<{
  kind: Kind;
  type: Kind.Type;
  func: Kind.Function;
}>((tie) => ({
  kind: fc.oneof(tie("type"), tie("func")),
  type: fc.constant(KType),
  func: fc.record({
    is: fc.constant(Kind.Is.Function),
    left: tie("kind"),
    right: tie("kind"),
  }),
}));

// export const ArbitraryType = fc.letrec<Type>((type) => fc.oneof(fc.record({})));
