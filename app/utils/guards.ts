export function isString(x: unknown): x is string {
  return !!x && typeof x === "string";
}
