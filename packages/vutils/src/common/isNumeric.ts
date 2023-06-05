/**
 * Checks if `value` is classified as a legal string number
 *
 * @param {*} value The string value to check.
 * @returns {boolean} Returns `true` if `value` is a legal string number, else `false`.
 * @example
 *
 * isNumeric(1)
 * // => false
 *
 * isNumeric('2.0')
 * // => true
 *
 * isNumeric('3a')
 * // => false
 *
 * isNumeric('4.a')
 * // => false
 *
 * isNumeric(Infinity)
 * // => false
 *
 * isNumeric('01')
 * // => true
 */
const isNumeric = (value: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
};

export default isNumeric;
