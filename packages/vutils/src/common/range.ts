import isValid from './isValid';

export function range(start: number, stop?: number, step?: number): number[] {
  if (!isValid(stop)) {
    stop = start;
    start = 0;
  }
  if (!isValid(step)) {
    step = 1;
  }

  let i = -1;
  const n = Math.max(0, Math.ceil((stop - start) / step)) | 0;
  const range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
}
