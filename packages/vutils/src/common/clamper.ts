export function clamper(a: number, b: number): (x: number) => number {
  let t;
  if (a > b) {
    t = a;
    a = b;
    b = t;
  }
  return (x: number) => {
    return Math.max(a, Math.min(b, x));
  };
}
