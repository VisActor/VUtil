export function equalArray(a1: any[], a2: any[]) {
  return a1.length === a2.length && a1.every((item, i) => item === a2[i]);
}
