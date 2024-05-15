/* Adapted from fmin by Ben Frederickson
 * https://github.com/benfred/fmin
 * Licensed under the BSD-3-Clause

 * url: https://github.com/benfred/fmin/blob/master/src/bisect.js
 * License: https://github.com/benfred/fmin/blob/master/LICENSE
 * @license
 */

import { Logger } from '../logger';

/** finds the zeros of a function, given two starting points (which must
 * have opposite signs */
export function findZeroOfFunction(f: any, a: any, b: any, parameters?: any) {
  parameters = parameters || {};
  const maxIterations = parameters.maxIterations || 100;
  const tolerance = parameters.tolerance || 1e-10;
  const fA = f(a);
  const fB = f(b);
  let delta = b - a;

  if (fA * fB > 0) {
    const logger = Logger.getInstance();
    logger.error('Initial bisect points must have opposite signs');
    return NaN;
  }

  if (fA === 0) {
    return a;
  }
  if (fB === 0) {
    return b;
  }

  for (let i = 0; i < maxIterations; ++i) {
    delta /= 2;
    const mid = a + delta;
    const fMid = f(mid);

    if (fMid * fA >= 0) {
      a = mid;
    }

    if (Math.abs(delta) < tolerance || fMid === 0) {
      return mid;
    }
  }
  return a + delta;
}