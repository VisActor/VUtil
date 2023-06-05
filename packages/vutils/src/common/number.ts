/**
 * @description 处理数值相关的方法
 */

const DEFAULT_ABSOLUTE_TOLERATE = 1e-10;
const DEFAULT_RELATIVE_TOLERATE = 1e-10;

/**
 * 判断两数是否接近相等，函数参数参照 python isClose 方法
 * @param {number} a
 * @param {number} b
 * @param refTol 指定的相对容差比例，将乘以两数的最大值作为相对容差
 * @param absTol 指定的绝对容差
 */
export function isNumberClose(
  a: number,
  b: number,
  relTol: number = DEFAULT_RELATIVE_TOLERATE,
  absTol: number = DEFAULT_ABSOLUTE_TOLERATE
) {
  const abs = absTol;
  const rel = relTol * Math.max(a, b);
  return Math.abs(a - b) <= Math.max(abs, rel);
}

/**
 * 判断 a 是否大于 b，并排除容差范围
 * @param a
 * @param b
 * @param relTol 指定的相对容差比例，将乘以两数的最大值作为相对容差
 * @param absTol 指定的绝对容差
 */
export function isGreater(a: number, b: number, relTol?: number, absTol?: number) {
  return a > b && !isNumberClose(a, b, relTol, absTol);
}

/**
 * 判断 a 是否小于 b，并排除容差范围
 * @param a
 * @param b
 * @param relTol 指定的相对容差比例，将乘以两数的最大值作为相对容差
 * @param absTol 指定的绝对容差
 */
export function isLess(a: number, b: number, relTol?: number, absTol?: number) {
  return a < b && !isNumberClose(a, b, relTol, absTol);
}
