/* Adapted from d3-time-format by Mike Bostock
 * https://github.com/d3/d3-format
 * Licensed under the ISC

 * License: https://github.com/d3/d3-format/blob/main/LICENSE
 * @license
 */
import { formatDecimalParts } from './formatDecimal';

export function formatRounded(x: number, p: number) {
  const d = formatDecimalParts(x, p);
  if (!d) {
    return x + '';
  }
  const coefficient = d[0];
  const exponent = d[1];
  return exponent < 0
    ? '0.' + new Array(-exponent).join('0') + coefficient
    : coefficient.length > exponent + 1
    ? coefficient.slice(0, exponent + 1) + '.' + coefficient.slice(exponent + 1)
    : coefficient + new Array(exponent - coefficient.length + 2).join('0');
}
