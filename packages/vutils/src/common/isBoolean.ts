import isType from './isType';

/**
 * Checks if `value` is classified as a boolean primitive or object.
 * @param {*} value The value to check.
 * @param {boolean} fuzzy Whether to perform fuzzy judgment, for better performance，default to `false`.
 * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
 * @example
 *
 * isBoolean(false)
 * // => true
 *
 * isBoolean(null)
 * // => false
 */
const isBoolean = (value: any, fuzzy: boolean = false): value is boolean => {
  if (fuzzy) {
    return typeof value === 'boolean';
  }
  return value === true || value === false || isType(value, 'Boolean');
};

export default isBoolean;
