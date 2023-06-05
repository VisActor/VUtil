export function ascending(a: number, b: number) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
