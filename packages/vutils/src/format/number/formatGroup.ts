/* Adapted from d3-time-format by Mike Bostock
 * https://github.com/d3/d3-format
 * Licensed under the ISC

 * License: https://github.com/d3/d3-format/blob/main/LICENSE
 * @license
 */
export function formatGroup(grouping: number[], thousands: string) {
  return function (value: string, width: number) {
    let i = value.length;
    const t = [];
    let j = 0;
    let g = grouping[0];
    let length = 0;

    while (i > 0 && g > 0) {
      if (length + g + 1 > width) {
        g = Math.max(1, width - length);
      }
      t.push(value.substring((i -= g), i + g));
      if ((length += g + 1) > width) {
        break;
      }
      g = grouping[(j = (j + 1) % grouping.length)];
    }

    return t.reverse().join(thousands);
  };
}
