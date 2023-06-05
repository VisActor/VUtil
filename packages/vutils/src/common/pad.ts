const repeat = (str: string | number, repeatCount: number = 0) => {
  let s = '';
  let i = repeatCount - 1;
  while (i >= 0) {
    s = `${s}${str}`;
    i -= 1;
  }
  return s;
};

/**
 * Pads `string` on the left and right, left or right sides if it's shorter than `length`.
 * Padding characters are truncated if they can't be evenly divided by `length`.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to pad.
 * @param {number} [length=0] The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padded string.
 * @example
 *
 * pad('abc', 8)
 * // => '  abc   '
 *
 * pad('abc', 8, '_-')
 * // => '_-abc_-_'
 *
 * pad('abc', 2)
 * // => 'abc'
 */
const pad = (str: string | number, length: number, padChar: string = ' ', align: string = 'right') => {
  const c = padChar;
  const s = str + '';
  const n = length - s.length;

  if (n <= 0) {
    return s;
  }

  if (align === 'left') {
    return repeat(c, n) + s;
  }

  return align === 'center' ? repeat(c, Math.floor(n / 2)) + s + repeat(c, Math.ceil(n / 2)) : s + repeat(c, n);
};

export default pad;
