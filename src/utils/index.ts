// Deep equality of presumably-immutable objects
export function eq(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (typeof a === "object") {
    if (typeof b !== "object") return false;
    if (a === null || b === null) return false;

    if (Array.isArray(a)) {
      if (!Array.isArray(b)) return false;

      if (a.length !== b.length) return false;

      return a.every((v, i) => eq(v, b[i]));
    }

    const compEntry = ([keyA]: [string, any], [keyB]: [string, any]) =>
      keyA < keyB ? -1 : keyA > keyB ? 1 : 0;

    const as = Object.entries(a).sort(compEntry);
    const bs = Object.entries(a).sort(compEntry);

    return eq(as, bs);
  }

  // All non-objects should have been equal
  return false;
}
