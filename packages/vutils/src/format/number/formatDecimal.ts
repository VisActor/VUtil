/* Adapted from d3-time-format by Mike Bostock
 * https://github.com/d3/d3-format
 * Licensed under the ISC

 * License: https://github.com/d3/d3-format/blob/main/LICENSE
 * @license
 */
export function formatDecimal(x: number) {
  return Math.abs((x = Math.round(x))) >= 1e21 ? x.toLocaleString('en').replace(/,/g, '') : x.toString(10);
}

export function formatDecimalParts(x: number, p?: number): [string, number] | null {
  const _x = p ? x.toExponential(p - 1) : x.toExponential();
  const i = _x.indexOf('e');
  if (i < 0) {
    return null; // NaN, ±Infinity
  }
  const coefficient = _x.slice(0, i);

  return [coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient, +_x.slice(i + 1)];
}
