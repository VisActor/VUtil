import { ascending } from './ascending';
import isNil from './isNil';
import { Logger } from '../logger';

/**
 * 通过二分法，查找数组a中大于数值x的第一个元素的序号
 * @param a
 * @param x
 * @param lo
 * @param hi
 * @returns
 */
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

/* Adapted from fmin by Ben Frederickson
 * https://github.com/benfred/fmin
 * Licensed under the BSD-3-Clause

 * url: https://github.com/benfred/fmin/blob/master/src/bisect.js
 * License: https://github.com/benfred/fmin/blob/master/LICENSE
 * @license
 */
/** finds the zeros of a function, given two starting points (which must
 * have opposite signs */
export function findZeroOfFunction(
  f: (entry: number) => number,
  a: number,
  b: number,
  parameters?: {
    maxIterations?: number;
    tolerance?: number;
  }
) {
  const maxIterations = parameters?.maxIterations ?? 100;
  const tolerance = parameters?.tolerance ?? 1e-10;
  const fA = f(a);
  const fB = f(b);
  let delta = b - a;

  if (fA * fB > 0) {
    const logger = Logger.getInstance();
    logger.error('Initial bisect points must have opposite signs');
    return NaN;
  }

  if (fA === 0) {
    return a;
  }
  if (fB === 0) {
    return b;
  }

  for (let i = 0; i < maxIterations; ++i) {
    delta /= 2;
    const mid = a + delta;
    const fMid = f(mid);

    if (fMid * fA >= 0) {
      a = mid;
    }

    if (Math.abs(delta) < tolerance || fMid === 0) {
      return mid;
    }
  }
  return a + delta;
}

/**
 * 二分靠近框架，返回数组中第一个大于等于目标值的数的索引
 * @param arr 数组
 * @param compareFn 比较函数，返回(当前值-目标值)
 */
export const binaryFuzzySearch = <T>(arr: T[], compareFn: (value: T) => number) => {
  return binaryFuzzySearchInNumberRange(0, arr.length, value => compareFn(arr[value]));
};

/**
 * 二分靠近框架，返回数字区间中第一个大于等于目标值的数字
 * @param x1 区间上界
 * @param x2 区间下界（不包含）
 * @param compareFn 比较函数，返回(当前值-目标值)
 */
export const binaryFuzzySearchInNumberRange = (x1: number, x2: number, compareFn: (value: number) => number) => {
  let left = x1;
  let right = x2;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (compareFn(mid) >= 0) {
      right = mid; // 第一个大于等于目标值的数
    } else {
      left = mid + 1;
    }
  }
  return left;
};
