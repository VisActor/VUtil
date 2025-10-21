import isNil from './isNil';

/**
 * Approximate inverse normal CDF (probit) using Acklam's algorithm.
 * Returns z such that P(Z <= z) = p for standard normal Z.
 */
export function invNorm(p: number) {
  if (p <= 0 || p >= 1) {
    return 0;
  }

  const a1 = -39.6968302866538;
  const a2 = 220.946098424521;
  const a3 = -275.928510446969;
  const a4 = 138.357751867269;
  const a5 = -30.6647980661472;
  const a6 = 2.50662827745924;

  const b1 = -54.4760987982241;
  const b2 = 161.585836858041;
  const b3 = -155.698979859887;
  const b4 = 66.8013118877197;
  const b5 = -13.2806815528857;

  const c1 = -0.00778489400243029;
  const c2 = -0.322396458041136;
  const c3 = -2.40075827716184;
  const c4 = -2.54973253934373;
  const c5 = 4.37466414146497;
  const c6 = 2.93816398269878;

  const d1 = 0.00778469570904146;
  const d2 = 0.32246712907004;
  const d3 = 2.445134137143;
  const d4 = 3.75440866190742;

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number;
  let r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }

  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
    );
  }

  q = Math.sqrt(-2 * Math.log(1 - p));
  return -((((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1));
}

export interface LinearCIComponents {
  min: number;
  max: number;
  n: number;
  X: number; // mean of x
  SSE: number;
  Sxx: number;
}

/**
 * Compute basic components used for linear regression confidence / prediction intervals.
 * - scans data to compute min/max of x, n, mean X, SSE and Sxx (sum (xi - X)^2).
 */
export function computeLinearCIComponents(
  data: any[],
  x: (d: any) => number,
  y: (d: any) => number,
  predict: (x: number) => number
): LinearCIComponents {
  // simple local scanner to avoid circular imports
  let min = Infinity;
  let max = -Infinity;
  let n = 0;
  let sumX = 0;

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    let dx = x(d);
    let dy = y(d);
    if (!isNil(dx) && (dx = +dx) >= dx && !isNil(dy) && (dy = +dy) >= dy) {
      if (dx < min) {
        min = dx;
      }
      if (dx > max) {
        max = dx;
      }
      n++;
      sumX += dx;
    }
  }

  if (n === 0) {
    return { min, max, n, X: 0, SSE: 0, Sxx: 0 };
  }

  const X = sumX / n;
  let SSE = 0;
  let Sxx = 0;
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    let dx = x(d);
    let dy = y(d);
    if (!isNil(dx) && (dx = +dx) >= dx && !isNil(dy) && (dy = +dy) >= dy) {
      const r = dy - predict(dx);
      SSE += r * r;
      const dxc = dx - X;
      Sxx += dxc * dxc;
    }
  }

  return { min, max, n, X, SSE, Sxx };
}

/**
 * Compute standard errors for mean and prediction at px using components.
 */
export function stdErrorsAt(px: number, comps: LinearCIComponents) {
  const { n, X, Sxx, SSE } = comps;
  const s2 = n > 2 ? SSE / (n - 2) : 0;
  const seMean = Sxx > 0 ? Math.sqrt(s2 * (1 / n + ((px - X) * (px - X)) / Sxx)) : Math.sqrt(s2 / n);
  const sePred = Math.sqrt(s2 * (1 + 1 / n + (Sxx > 0 ? ((px - X) * (px - X)) / Sxx : 0)));
  return { seMean, sePred };
}

export default {
  invNorm,
  computeLinearCIComponents,
  stdErrorsAt
};
