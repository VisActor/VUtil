/**
 * 获取数组中的最大值
 * @param arr 数组
 * @param compareFn 比较函数，返回正数表示 a > b，返回负数表示 a < b，返回 0 表示相等
 * @returns
 */
export const max = <T>(arr: T[], compareFn?: (a: T, b: T) => number): T | undefined => {
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
