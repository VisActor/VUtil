/* Adapted from d3-time-format by Mike Bostock
 * https://github.com/d3/d3-format
 * Licensed under the ISC

 * License: https://github.com/d3/d3-format/blob/main/LICENSE
 * @license
 */
export function formatTrim(s: string) {
  const n = s.length;
  let i0 = -1;
  let i1;
  out: for (let i = 1; i < n; ++i) {
    switch (s[i]) {
      case '.':
        i0 = i1 = i;
        break;
      case '0':
        if (i0 === 0) {
          i0 = i;
        }
        i1 = i;
        break;
      default:
        if (!+s[i]) {
          break out;
        }
        if (i0 > 0) {
          i0 = 0;
        }
        break;
    }
  }
  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}
