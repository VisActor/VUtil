import isType from './isType';

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
 * classified as numbers, use the `Number.isFinite` method.
 *
 * @param {*} value The value to check.
 * @param {boolean} fuzzy Whether to perform fuzzy judgment, for better performance，default to `false`.
 * @returns {boolean} Returns `true` if `value` is a number, else `false`.
 * @example
 *
 * isNumber(3)
 * // => true
 *
 * isNumber(Number.MIN_VALUE)
 * // => true
 *
 * isNumber(Infinity)
 * // => true
 *
 * isNumber('3')
 * // => false
 */
const isNumber = (value: any, fuzzy: boolean = false): value is number => {
  const type = typeof value;
  if (fuzzy) {
    return type === 'number';
  }
  return type === 'number' || isType(value, 'Number');
};

export default isNumber;
