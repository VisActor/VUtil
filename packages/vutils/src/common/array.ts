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
 * 获取数组中的最大值
 * @param arr 数组
 * @param compareFn 比较函数，返回正数表示 a > b，返回负数表示 a < b，返回 0 表示相等
 * @returns
 */
export const maxInArray = <T>(arr: T[], compareFn?: (a: T, b: T) => number): T | undefined => {
  if (arr.length === 0) {
    return undefined;
  }
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    const value = arr[i];
    if (compareFn?.(value, max) ?? (value as number) - (max as number) > 0) {
      max = value;
    }
  }
  return max;
};

/**
 * 获取数组中的最小值
 * @param arr 数组
 * @param compareFn 比较函数，返回正数表示 a > b，返回负数表示 a < b，返回 0 表示相等
 * @returns
 */
export const minInArray = <T>(arr: T[], compareFn?: (a: T, b: T) => number): T | undefined => {
  if (arr.length === 0) {
    return undefined;
  }
  let min = arr[0];
  for (let i = 1; i < arr.length; i++) {
    const value = arr[i];
    if (compareFn?.(value, min) ?? (value as number) - (min as number) < 0) {
      min = value;
    }
  }
  return min;
};

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
