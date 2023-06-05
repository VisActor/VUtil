const e10 = Math.sqrt(50);
const e5 = Math.sqrt(10);
const e2 = Math.sqrt(2);

/**
 * 根据start、stop、count进行分割，不要求count完全准确
 * @param start
 * @param stop
 * @param count
 * @returns
 */
export function ticks(start: number, stop: number, count: number) {
  let reverse;
  let i = -1;
  let n;
  let ticks;
  let step;

  stop = +stop;
  start = +start;
  count = +count;
  if (Math.abs(start - stop) <= Number.MIN_VALUE && count > 0) {
    return [start];
  }
  if ((reverse = stop < start)) {
    n = start;
    start = stop;
    stop = n;
  }

  step = tickIncrement(start, stop, count);
  if (stop === 0 || !isFinite(step)) {
    return [];
  }

  if (step > 0) {
    let r0 = Math.round(start / step);
    let r1 = Math.round(stop / step);
    if (r0 * step < start) {
      ++r0;
    }
    if (r1 * step > stop) {
      --r1;
    }
    ticks = new Array((n = r1 - r0 + 1));
    while (++i < n) {
      ticks[i] = (r0 + i) * step;
    }
  } else {
    step = -step;
    let r0 = Math.round(start * step);
    let r1 = Math.round(stop * step);
    if (r0 / step < start) {
      ++r0;
    }
    if (r1 / step > stop) {
      --r1;
    }
    ticks = new Array((n = r1 - r0 + 1));
    while (++i < n) {
      ticks[i] = (r0 + i) / step;
    }
  }

  if (reverse) {
    ticks.reverse();
  }

  return ticks;
}

export function tickIncrement(start: number, stop: number, count: number) {
  const step = (stop - start) / Math.max(0, count);
  const power = Math.floor(Math.log(step) / Math.LN10); // 对数取整
  const error = step / 10 ** power;

  let gap = 1;
  if (error >= e10) {
    gap = 10;
  } else if (error >= e5) {
    gap = 5;
  } else if (error >= e2) {
    gap = 2;
  }

  if (power >= 0) {
    return gap * 10 ** power;
  }
  return -(10 ** -power) / gap;
}

/**
 * 严格根据start、stop、count进行分割，要求start、stop、count完全准确（除了count = 1的情况下stop可能不准确）
 * @param start
 * @param stop
 * @param count
 * @returns
 */
export function forceTicks(start: number, stop: number, count: number) {
  let step;

  stop = +stop;
  start = +start;
  count = +count;
  if (start === stop && count > 0) {
    return [start];
  }
  if (count <= 0 || (step = forceTickIncrement(start, stop, count)) === 0 || !isFinite(step)) {
    return [];
  }

  const ticks = new Array(count);
  for (let i = 0; i < count; i++) {
    ticks[i] = start + i * step;
  }

  return ticks;
}

export function forceTickIncrement(start: number, stop: number, count: number) {
  // 用绝对数值做步进距离
  const step = (stop - start) / Math.max(1, count - 1);
  return step;
}

/**
 * 给定step的ticks分割
 * @param start
 * @param stop
 * @param step
 * @returns
 */
export function stepTicks(start: number, stop: number, step: number) {
  let i = -1;
  let n;
  let reverse;

  stop = +stop;
  start = +start;
  step = +step;
  if ((reverse = stop < start)) {
    n = start;
    start = stop;
    stop = n;
  }
  if (!isFinite(step) || stop - start <= step) {
    return [start];
  }
  const count = Math.floor((stop - start) / step + 1);
  const ticks = new Array(count);
  while (++i < count) {
    ticks[i] = start + i * step;
  }
  if (reverse) {
    ticks.reverse();
  }
  return ticks;
}

export function niceLinear(d: number[], count: number = 10) {
  let i0 = 0;
  let i1 = d.length - 1;
  let start = d[i0];
  let stop = d[i1];
  let prestep;
  let step;
  let maxIter = 10;

  if (stop < start) {
    step = start;
    start = stop;
    stop = step;
    step = i0;
    i0 = i1;
    i1 = step;
  }

  while (maxIter-- > 0) {
    step = tickIncrement(start, stop, count);
    if (step === prestep) {
      d[i0] = start;
      d[i1] = stop;
      return d;
    } else if (step > 0) {
      start = Math.floor(start / step) * step;
      stop = Math.ceil(stop / step) * step;
    } else if (step < 0) {
      start = Math.ceil(start * step) / step;
      stop = Math.floor(stop * step) / step;
    } else {
      break;
    }
    prestep = step;
  }

  return;
}
