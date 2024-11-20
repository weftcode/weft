import { describe, it, expect } from "@jest/globals";

import { union, varsInPred, varsInType, varsInQualType } from "../Vars";
import { TVar, TFunc } from "../BuiltIns";

describe("List Union", () => {
  it("with an empty list", () => {
    expect(union([TVar("a")], [])).toEqual([TVar("a")]);
    expect(union([], [TVar("a")])).toEqual([TVar("a")]);
  });

  it("disjoint elements", () => {
    expect(union([0], [1])).toEqual([0, 1]);
    expect(union([TVar("a")], [TVar("b")])).toEqual([TVar("a"), TVar("b")]);
  });

  it("overlapping elements", () => {
    expect(union([TVar("a"), TVar("b")], [TVar("a"), TVar("c")])).toEqual([
      TVar("a"),
      TVar("b"),
      TVar("c"),
    ]);
  });
});

describe("Type Variable Functions", () => {
  describe("varsInType", () => {
    it("type `a`", () => {
      expect(varsInType(TVar("a"))).toEqual([TVar("a")]);
    });
    it("type `a -> b`", () => {
      expect(varsInType(TFunc(TVar("a"), TVar("b")))).toEqual([
        TVar("a"),
        TVar("b"),
      ]);
    });
  });

  describe("varsInPred", () => {
    it("type `Eq a`", () => {
      expect(varsInPred({ isIn: "Eq", type: TVar("a") })).toEqual([TVar("a")]);
    });
  });

  describe("varsInQualType", () => {
    it("type `Eq a => a", () => {
      expect(
        varsInQualType({
          preds: [{ isIn: "Eq", type: TVar("a") }],
          type: TVar("a"),
        })
      ).toEqual([TVar("a")]);
    });
  });
});
