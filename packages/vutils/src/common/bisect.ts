import { ascending } from './ascending';
import isNil from './isNil';

export function bisect(a: number[], x: number, lo: number = 0, hi?: number) {
  if (isNil(hi)) {
    hi = a.length;
  }
  while (lo < (hi as number)) {
    const mid: number = (lo + (hi as number)) >>> 1;
    if (ascending(a[mid], x) > 0) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}
