export function seedRandom(seed: number) {
  return parseFloat('0.' + Math.sin(seed).toString().substring(6));
}

/* Adapted from vega by University of Washington Interactive Data Lab
 * https://vega.github.io/vega/
 * Licensed under the BSD-3-Clause

 * url: https://github.com/vega/vega/blob/main/packages/vega-statistics/src/lcg.js
 * License: https://github.com/vega/vega/blob/main/LICENSE
 * @license
 */

// https://en.wikipedia.org/wiki/Linear_congruential_generator#Parameters_in_common_use
const a = 1664525;
const c = 1013904223;
const m = 4294967296; // 2^32

export function randomLCG(initS: number = 1) {
  let s = initS;
  return () => (s = (a * s + c) % m) / m;
}

/**
 * 随机拟合
 */
export const fakeRandom = () => {
  let i = -1;
  const arr = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  return () => {
    i = (i + 1) % arr.length;
    return arr[i];
  };
};
