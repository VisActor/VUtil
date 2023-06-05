import isArray from './isArray';
import isArrayLike from './isArrayLike';
import isValid from './isValid';

/**
 * 将传入数据转换为数组格式
 * @param arr 入参。
 * @returns 数组
 */
export function array<T>(arr?: T | T[]): T[] {
  if (isValid(arr)) {
    return isArray(arr) ? arr : [arr];
  }
  return [];
}

/**
 * 获取数组的最后一个值，如果传入的参数为非数组，则返回 undefined
 * @param val any
 * @returns
 */
export function last<T>(val: T | T[]): T | undefined {
  if (isArrayLike(val)) {
    const arr = val as ArrayLike<any>;
    return arr[arr.length - 1];
  }
  return undefined;
}

/**
 * 获取数组第一项与最后一项的差值，如果数组为空则返回 0
 * @param arr
 * @returns
 */
export const span = (arr: number[]) => {
  if (arr.length <= 1) {
    return 0;
  }
  return (last(arr) as number) - arr[0];
};

/**
 * 计算数组中的最大值，如果传入值不合法，则放回 undefined
 * @param arr
 * @returns
 */
export function maxInArray(arr: number[]): number | undefined {
  if (!arr || !isArray(arr)) {
    return undefined;
  }
  return arr.reduce((prev, curr) => Math.max(prev, curr), -Infinity);
}

/**
 * 计算数组中的最小值，如果传入值不合法，则放回 undefined
 * @param arr
 * @returns
 */
export function minInArray(arr: number[]): number | undefined {
  if (!arr || !isArray(arr)) {
    return undefined;
  }
  return arr.reduce((prev, curr) => Math.min(prev, curr), Infinity);
}

/**
 * 判断两个数组是否相同
 * @param a
 * @param b
 * @returns
 */
export function arrayEqual(a: any, b: any): boolean {
  if (!isArray(a) || !isArray(b)) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

/**
 * 封装并返回无重复的数组
 * @param arr
 * @returns
 */
export function uniqArray<T>(arr: T | T[]): T | T[] {
  if (!arr || !isArray(arr)) {
    return arr;
  }
  return Array.from(new Set(array(arr)));
}

// Based on http://jsfromhell.com/array/shuffle
export function shuffleArray<T>(arr: T[], random: () => number = Math.random): T[] {
  let j;
  let x;
  let i = arr.length;

  while (i) {
    j = Math.floor(random() * i);
    x = arr[--i];
    arr[i] = arr[j];
    arr[j] = x;
  }
  return arr;
}

/**
 * 展开多层数组，非数组内容将变为 [input]
 * @param arr
 * @returns
 */
export function flattenArray(arr: any): any[] {
  if (!isArray(arr)) {
    return [arr];
  }
  const result = [];
  for (const value of arr) {
    result.push(...flattenArray(value));
  }
  return result;
}
