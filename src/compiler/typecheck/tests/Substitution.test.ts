import { describe, it, expect } from "@jest/globals";

import { applyToType, combine } from "../Substitution";
import { TVar } from "../BuiltIns";

describe("combine", () => {
  it("{ 'b' |-> 'c' } and { 'a' |-> 'b' }", () => {
    expect(combine({ b: TVar("c") }, { a: TVar("b") })).toEqual({
      a: TVar("c"),
      b: TVar("c"),
    });
  });
});

describe("applyToType", () => {
  it("on type variables", () => {
    expect(applyToType({ a: TVar("b") }, TVar("a"))).toEqual(TVar("b"));
  });
});
