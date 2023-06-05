import { toNumber } from './toNumber';

export function quantileSorted(
  values: any[],
  percent: number,
  valueof: (entry: any, index: number, arr: any[]) => number = toNumber
) {
  const n = values.length;
  if (!n) {
    return;
  }
  if (percent <= 0 || n < 2) {
    return valueof(values[0], 0, values);
  }
  if (percent >= 1) {
    return valueof(values[n - 1], n - 1, values);
  }
  const i = (n - 1) * percent;
  const i0 = Math.floor(i);
  const value0 = valueof(values[i0], i0, values);
  const value1 = valueof(values[i0 + 1], i0 + 1, values);
  return value0 + (value1 - value0) * (i - i0);
}
