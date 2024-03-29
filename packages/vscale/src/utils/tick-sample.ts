import { range, memoize, isNumber } from '@visactor/vutils';
import type { TransformType, ContinuousTicksFunc, NiceOptions, NiceType } from '../interface';
import { niceNumber, restrictNumber } from './utils';

const e10 = Math.sqrt(50);
const e5 = Math.sqrt(10);
const e2 = Math.sqrt(2);
const niceNumbers = [1, 2, 5, 10];

type TicksFunc = (start: number, stop: number, count: number) => number[];
// eslint-disable-next-line max-len
type TicksBaseTransformFunc = (
  start: number,
  stop: number,
  count: number,
  base: number,
  transformer: TransformType,
  untransformer: TransformType
) => number[];
// eslint-disable-next-line max-len
type ForceTicksBaseTransformFunc = (
  start: number,
  stop: number,
  count: number,
  transformer: TransformType,
  untransformer: TransformType
) => number[];
type D3TicksForLogTransformFunc = (
  start: number,
  stop: number,
  count: number,
  base: number,
  transformer: TransformType,
  untransformer: TransformType,
  options?: {
    noDecimals?: boolean;
  }
) => number[];

export const calculateTicksOfSingleValue = (value: number, tickCount: number, noDecimals?: boolean) => {
  let step = 1;
  let start = value;
  const middleIndex = Math.floor((tickCount - 1) / 2);
  const absVal = Math.abs(value);

  if (value >= 0 && value <= Number.MIN_VALUE) {
    start = 0;
  } else if (value < 0 && value >= -Number.MIN_VALUE) {
    start = -(tickCount - 1);
  } else if (!noDecimals && absVal < 1) {
    step = getNickStep(absVal).step;
    // middle = new Decimal(Math.floor(middle.div(step).toNumber())).mul(step);
  } else if (noDecimals || absVal > 1) {
    start = Math.floor(value) - middleIndex * step;
  }

  if (step > 0) {
    if (value > 0) {
      start = Math.max(start, 0);
    } else if (value < 0) {
      // < 0;
      start = Math.min(start, -(tickCount - 1) * step);
    }

    return range(0, tickCount).map((index: number) => start + index * step);
  }

  return value > 0
    ? calculateTicksByStep(0, -(tickCount - 1) / step, step)
    : calculateTicksByStep((tickCount - 1) / step, 0, step);
};

/**
 * 根据start、stop、count进行分割，不要求count完全准确
 * @param start
 * @param stop
 * @param count
 * @returns
 */
export const d3Ticks = memoize<ContinuousTicksFunc>(
  (start: number, stop: number, count: number, options?: { noDecimals?: boolean }) => {
    let reverse;
    let i = -1;
    let n;
    let ticks;
    let step;

    stop = +stop;
    start = +start;
    count = +count;

    // add check for start equal stop
    if (start === stop) {
      return [start];
    }

    if (Math.abs(start - stop) <= Number.MIN_VALUE && count > 0) {
      return [start];
    }
    if ((reverse = stop < start)) {
      n = start;
      start = stop;
      stop = n;
    }
    step = tickIncrement(start, stop, count).step;
    // why return empty array when stop === 0 ?
    // if (stop === 0 || !isFinite(step)) {
    if (!isFinite(step)) {
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
    } else if (step < 0 && options?.noDecimals) {
      step = 1;
      const r0 = Math.ceil(start);
      const r1 = Math.floor(stop);

      if (r0 <= r1) {
        ticks = new Array((n = r1 - r0 + 1));
        while (++i < n) {
          ticks[i] = r0 + i;
        }
      } else {
        return [];
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
);

const calculateTicksByStep = (start: number, stop: number, step: number) => {
  let i = -1;
  let n;
  let ticks;

  if (step > 0) {
    let r0 = Math.floor(start / step);
    let r1 = Math.ceil(stop / step);
    if ((r0 + 1) * step < start) {
      ++r0;
    }
    if ((r1 - 1) * step > stop) {
      --r1;
    }
    ticks = new Array((n = r1 - r0 + 1));
    while (++i < n) {
      ticks[i] = (r0 + i) * step;
    }
  } else {
    step = -step;
    let r0 = Math.floor(start * step);
    let r1 = Math.ceil(stop * step);
    if ((r0 + 1) / step < start) {
      ++r0;
    }
    if ((r1 - 1) / step > stop) {
      --r1;
    }
    ticks = new Array((n = r1 - r0 + 1));
    while (++i < n) {
      ticks[i] = (r0 + i) / step;
    }
  }

  return ticks;
};

export const appendTicksToCount = (ticks: number[], count: number, step: number) => {
  let n: number;
  const firstTick = ticks[0];
  const lastTick = ticks[ticks.length - 1];
  const appendCount = count - ticks.length;

  if (lastTick <= 0) {
    const headTicks: number[] = [];
    // append to head
    for (n = appendCount; n >= 1; n--) {
      headTicks.push(firstTick - n * step);
    }
    return headTicks.concat(ticks);
  } else if (firstTick >= 0) {
    // append to tail
    for (n = 1; n <= appendCount; n++) {
      ticks.push(lastTick + n * step);
    }

    return ticks;
  }
  let headTicks: number[] = [];
  const tailTicks: number[] = [];
  // append to head and tail
  for (n = 1; n <= appendCount; n++) {
    if (n % 2 === 0) {
      headTicks = [firstTick - Math.floor(n / 2) * step].concat(headTicks);
    } else {
      tailTicks.push(lastTick + Math.ceil(n / 2) * step);
    }
  }

  return headTicks.concat(ticks).concat(tailTicks);
};

/**
 * 根据start、stop、count进行分割，不要求count完全准确
 * @param start
 * @param stop
 * @param count
 * @returns
 */
export const ticks = memoize<ContinuousTicksFunc>(
  (start: number, stop: number, count: number, options?: { noDecimals?: boolean }) => {
    let reverse;
    let ticks;
    let n;
    const maxIterations = 5;

    stop = +stop;
    start = +start;
    count = +count;

    // add check for start equal stop
    if (start === stop) {
      return calculateTicksOfSingleValue(start, count, options?.noDecimals);
    }

    if (Math.abs(start - stop) <= Number.MIN_VALUE && count > 0) {
      return calculateTicksOfSingleValue(start, count, options?.noDecimals);
    }
    if ((reverse = stop < start)) {
      n = start;
      start = stop;
      stop = n;
    }
    const stepRes = tickIncrement(start, stop, count);
    let step = stepRes.step;
    // why return empty array when stop === 0 ?
    // if (stop === 0 || !isFinite(step)) {
    if (!isFinite(step)) {
      return [];
    }

    if (step > 0) {
      let cur = 1;
      const { power, gap } = stepRes;
      const delatStep = gap === 10 ? 2 * 10 ** power : 1 * 10 ** power;
      while (
        cur <= maxIterations &&
        ((ticks = calculateTicksByStep(start, stop, step)), ticks.length > count + 1) &&
        count > 2
      ) {
        step += delatStep;

        cur += 1;
      }

      if (count > 2 && ticks.length < count - 1) {
        ticks = appendTicksToCount(ticks, count, step);
      }
    } else {
      if (options?.noDecimals && step < 0) {
        step = 1;
      }
      ticks = calculateTicksByStep(start, stop, step);
    }

    if (reverse) {
      ticks.reverse();
    }

    return ticks;
  }
);

const getNickStep = (step: number) => {
  const power = Math.floor(Math.log(step) / Math.LN10); // 对数取整
  const error = step / 10 ** power;

  let gap = niceNumbers[0];
  if (error >= e10) {
    gap = niceNumbers[3];
  } else if (error >= e5) {
    gap = niceNumbers[2];
  } else if (error >= e2) {
    gap = niceNumbers[1];
  }

  if (power >= 0) {
    return { step: gap * 10 ** power, gap, power };
  }
  return { step: -(10 ** -power) / gap, gap, power };
};

export function tickIncrement(start: number, stop: number, count: number) {
  const step = (stop - start) / Math.max(0, count);
  return getNickStep(step);
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
    step = tickIncrement(start, stop, count).step;
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

export function parseNiceOptions(originalDomain: number[], option: NiceOptions) {
  const hasForceMin = isNumber(option.forceMin);
  const hasForceMax = isNumber(option.forceMax);
  let niceType: NiceType = null;
  const niceMinMax = [];
  let niceDomain: number[] = null;

  const domainValidator =
    hasForceMin && hasForceMax
      ? (x: number) => x >= option.forceMin && x <= option.forceMax
      : hasForceMin
      ? (x: number) => x >= option.forceMin
      : hasForceMax
      ? (x: number) => x <= option.forceMax
      : null;

  if (hasForceMin) {
    niceMinMax[0] = option.forceMin;
  } else if (
    isNumber(option.min) &&
    option.min <= Math.min(originalDomain[0], originalDomain[originalDomain.length - 1])
  ) {
    niceMinMax[0] = option.min;
  }

  if (hasForceMax) {
    niceMinMax[1] = option.forceMax;
  } else if (
    isNumber(option.max) &&
    option.max >= Math.max(originalDomain[0], originalDomain[originalDomain.length - 1])
  ) {
    niceMinMax[1] = option.max;
  }

  if (isNumber(niceMinMax[0]) && isNumber(niceMinMax[1])) {
    niceDomain = originalDomain.slice();
    niceDomain[0] = niceMinMax[0];
    niceDomain[niceDomain.length - 1] = niceMinMax[1];
  } else if (!isNumber(niceMinMax[0]) && !isNumber(niceMinMax[1])) {
    niceType = 'all';
  } else if (!isNumber(niceMinMax[0])) {
    niceType = 'min';
  } else {
    niceType = 'max';
  }

  return { niceType, niceDomain, niceMinMax, domainValidator };
}

export const fixPrecision = (start: number, stop: number, value: number) => {
  return Math.abs(stop - start) < 1 ? +value.toFixed(1) : Math.round(+value);
};

export const d3TicksForLog = memoize<D3TicksForLogTransformFunc>(
  (
    start: number,
    stop: number,
    count: number,
    base: number,
    transformer: TransformType,
    untransformer: TransformType,
    options?: { noDecimals?: boolean }
  ) => {
    let u = start;
    let v = stop;
    const r = v < u;

    if (r) {
      [u, v] = [v, u];
    }

    let i = transformer(u);
    let j = transformer(v);
    let k;
    let t;
    let z = [];

    if (!(base % 1) && j - i < count) {
      // this._base is integer
      (i = Math.floor(i)), (j = Math.ceil(j));
      if (u > 0) {
        for (; i <= j; ++i) {
          for (k = 1; k < base; ++k) {
            t = i < 0 ? k / untransformer(-i) : k * untransformer(i);
            if (t < u) {
              continue;
            }
            if (t > v) {
              break;
            }
            z.push(t);
          }
        }
      } else {
        for (; i <= j; ++i) {
          for (k = base - 1; k >= 1; --k) {
            t = i > 0 ? k / untransformer(-i) : k * untransformer(i);
            if (t < u) {
              continue;
            }
            if (t > v) {
              break;
            }
            z.push(t);
          }
        }
      }
      if (z.length * 2 < count) {
        z = ticks(u, v, count);
      }
    } else {
      z = ticks(i, j, Math.min(j - i, count)).map(untransformer);
    }
    z = z.filter((t: number) => t !== 0);
    if (options?.noDecimals) {
      z = Array.from(new Set(z.map((t: number) => Math.floor(t))));
    }
    return r ? z.reverse() : z;
  }
);

export const ticksBaseTransform = memoize<TicksBaseTransformFunc>(
  (
    start: number,
    stop: number,
    count: number,
    base: number,
    transformer: TransformType,
    untransformer: TransformType
  ) => {
    const ticksResult: number[] = [];
    const ticksMap = {};
    const startExp = transformer(start);
    const stopExp = transformer(stop);
    let ticksExp = [];
    // get ticks exp
    if (Number.isInteger(base)) {
      ticksExp = ticks(startExp, stopExp, count);
    } else {
      const stepExp = (stopExp - startExp) / (count - 1);
      for (let i = 0; i < count; i++) {
        ticksExp.push(startExp + i * stepExp);
      }
    }
    ticksExp.forEach((tl: number) => {
      // get pow
      const power = untransformer(tl);
      // nice
      const nicePower = Number.isInteger(base)
        ? fixPrecision(start, stop, power)
        : fixPrecision(start, stop, niceNumber(power));
      // scope
      const scopePower = fixPrecision(start, stop, restrictNumber(nicePower, [start, stop]));
      // dedupe
      if (!ticksMap[scopePower] && !isNaN(scopePower) && ticksExp.length > 1) {
        ticksMap[scopePower] = 1;
        ticksResult.push(scopePower);
      }
    });
    return ticksResult;
  }
);

export const forceTicksBaseTransform = memoize<ForceTicksBaseTransformFunc>(
  (start: number, stop: number, count: number, transformer: TransformType, untransformer: TransformType) => {
    const startExp = transformer(start);
    const stopExp = transformer(stop);
    const ticksExp = forceTicks(startExp, stopExp, count);
    return ticksExp.map((te: number) => niceNumber(untransformer(te)));
  }
);

export const forceStepTicksBaseTransform = memoize<ForceTicksBaseTransformFunc>(
  (start: number, stop: number, step: number, transformer: TransformType, untransformer: TransformType) => {
    const startExp = transformer(start);
    const stopExp = transformer(stop);
    const ticksExp = stepTicks(startExp, stopExp, step);
    return ticksExp.map((te: number) => niceNumber(untransformer(te)));
  }
);
