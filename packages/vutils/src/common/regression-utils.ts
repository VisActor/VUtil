import isNil from './isNil';
import { normalQuantile as invNorm } from './normalQuantile';
export { invNorm };

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
