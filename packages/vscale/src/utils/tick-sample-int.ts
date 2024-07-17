import { clamper } from '@visactor/vutils';

function generateTicks(start: number, stop: number, step: number, reverse: boolean) {
  const ticks: number[] = [];
  let ptr = start;
  while (ptr <= stop) {
    ticks.push(ptr);
    ptr += step;
  }
  if (reverse) {
    ticks.reverse();
  }

  return ticks;
}

/**
 * 根据start、stop、count进行分割，不要求count完全准确，但是保证均匀，输出为整数数组
 * @param start
 * @param stop
 * @param count
 * @param allowExcessive 如果为true，实际输出的tick数 >= count，否则实际输出的tick数 <= count
 * @returns
 */
export function ticks(start: number, stop: number, count: number, allowExcessive?: boolean) {
  let reverse: boolean;
  let step: number;

  stop = Math.floor(+stop);
  start = Math.floor(+start);
  count = Math.floor(+count);
  if (!count) {
    return [];
  }
  if (start === stop) {
    return [start];
  }
  if ((reverse = stop < start)) {
    const n = start;
    start = stop;
    stop = n;
  }

  let expectedCount = clamper(1, stop - start + 1)(count);
  step = Math.floor((stop - start + 1) / expectedCount);
  if (!allowExcessive) {
    while (
      Math.ceil((stop - start + 1) / step) > count && // 估算实际的tick数量，根据数量调整step
      expectedCount > 1
    ) {
      expectedCount -= 1;
      step = Math.floor((stop - start) / expectedCount);
    }
  }

  return generateTicks(start, stop, step, reverse);
}

/**
 * 给定step的ticks分割
 * @param start
 * @param stop
 * @param step
 * @returns
 */
export function stepTicks(start: number, stop: number, step: number) {
  let reverse: boolean;

  stop = Math.floor(+stop);
  start = Math.floor(+start);
  step = clamper(1, stop - start + 1)(Math.floor(+step));
  if ((reverse = stop < start)) {
    const n = start;
    start = stop;
    stop = n;
  }
  return generateTicks(start, stop, step, reverse);
}
