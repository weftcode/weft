import { describe, it, expect } from "@jest/globals";

import { eq } from ".";

describe("eq", () => {
  it("equivalent objects", () => {
    expect(eq({}, {})).toBe(true);
    expect(eq({ foo: "a" }, { foo: "a" })).toBe(true);
  });

  it("non-equivalent objects", () => {
    expect(eq({ foo: "a" }, { foo: "b" })).toBe(false);
  });
});
