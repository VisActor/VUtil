/* Adapted from d3-time-format by Mike Bostock
 * https://github.com/d3/d3-format
 * Licensed under the ISC

 * License: https://github.com/d3/d3-format/blob/main/LICENSE
 * @license
 */
import { formatDecimalParts } from './formatDecimal';

export let prefixExponent: number;

export function formatPrefixAuto(x: number, p: number) {
  const d = formatDecimalParts(x, p);
  if (!d) {
    return x + '';
  }
  const coefficient = d[0];
  const exponent = d[1];
  const i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1;
  const n = coefficient.length;
  return i === n
    ? coefficient
    : i > n
    ? coefficient + new Array(i - n + 1).join('0')
    : i > 0
    ? coefficient.slice(0, i) + '.' + coefficient.slice(i)
    : '0.' + new Array(1 - i).join('0') + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
}
