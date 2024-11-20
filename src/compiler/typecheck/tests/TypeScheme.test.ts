import { describe, it, expect } from "@jest/globals";

import { Type } from "../Type";
import { quantify } from "../TypeScheme";
import { KType, TVar } from "../BuiltIns";

describe("quantify", () => {
  it("type `a`", () => {
    expect(quantify([], { preds: [], type: TVar("a") })).toEqual({
      forAll: [KType],
      qual: { preds: [], type: { is: Type.Is.Gen, num: 0 } },
    });
  });
});
