import isType from './isType';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 * @param {*} value The value to check.
 * @param {boolean} fuzzy Whether to perform fuzzy judgment, for better performance，default to `false`.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * isString('abc')
 * // => true
 *
 * isString(1)
 * // => false
 */
const isString = (value: any, fuzzy: boolean = false): value is string => {
  const type = typeof value;
  if (fuzzy) {
    return type === 'string';
  }

  return type === 'string' || isType(value, 'String');
};

export default isString;
