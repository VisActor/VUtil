import isNil from './isNil';
import { computeLinearCIComponents, invNorm, stdErrorsAt } from './regression-utils';

/**
 * Linear regression utilities (single clean implementation).
 * Exports: ordinaryLeastSquares, visitPoints, rSquared, regressionLinear
 */

export function ordinaryLeastSquares(uX: number, uY: number, uXY: number, uX2: number) {
  const denom = uX2 - uX * uX;
  if (Math.abs(denom) < Number.EPSILON) {
    return { a: uY, b: 0 };
  }
  const b = (uXY - uX * uY) / denom;
  const a = uY - b * uX;
  return { a, b };
}

export function visitPoints(
  data: any[],
  x: (d: any) => number,
  y: (d: any) => number,
  callback: (x: number, y: number, index: number) => void
) {
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    let xi = x(d);
    let yi = y(d);
    if (!isNil(xi) && (xi = +xi) >= xi && !isNil(yi) && (yi = +yi) >= yi) {
      callback(xi, yi, i);
    }
  }
}

export function rSquared(
  data: any[],
  x: (d: any) => number,
  y: (d: any) => number,
  uY: number,
  predict: (x: number) => number
) {
  let ssr = 0;
  let sst = 0;
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    let yi = y(d);
    if (!isNil(yi) && (yi = +yi) >= yi) {
      const p = predict(x(d));
      const r = yi - p;
      ssr += r * r;
      const t = yi - uY;
      sst += t * t;
    }
  }
  return sst === 0 ? 0 : 1 - ssr / sst;
}

export function regressionLinear(
  data: any[],
  x: (d: any) => number = d => d.x,
  y: (d: any) => number = d => d.y,
  options?: {
    alpha?: number;
  }
) {
  const alpha = options?.alpha ?? 0.05;
  // accumulate online means (sufficient statistics)
  let n = 0;
  let meanX = 0;
  let meanY = 0;
  let meanXY = 0;
  let meanX2 = 0;

  visitPoints(data, x, y, (xi, yi) => {
    n++;
    meanX += (xi - meanX) / n;
    meanY += (yi - meanY) / n;
    meanXY += (xi * yi - meanXY) / n;
    meanX2 += (xi * xi - meanX2) / n;
  });

  const { a, b } = ordinaryLeastSquares(meanX, meanY, meanXY, meanX2);
  const predict = (xx: number) => a + b * xx;

  const comps = computeLinearCIComponents(data, x, y, predict);

  function evaluateGrid(N: number) {
    const out: { x: number; y: number }[] = [];
    if (comps.n === 0 || N <= 0) {
      return out;
    }
    if (comps.min === comps.max) {
      for (let i = 0; i < N; i++) {
        out.push({ x: comps.min, y: predict(comps.min) });
      }
      return out;
    }
    const step = (comps.max - comps.min) / (N - 1);
    for (let i = 0; i < N; i++) {
      const px = i === N - 1 ? comps.max : comps.min + step * i;
      out.push({ x: px, y: predict(px) });
    }
    return out;
  }

  function confidenceInterval(N: number = 50) {
    const out: { x: number; mean: number; lower: number; upper: number; predLower: number; predUpper: number }[] = [];
    if (comps.n === 0 || N <= 0) {
      return out;
    }
    const z = invNorm(1 - alpha / 2);
    if (comps.min === comps.max) {
      const m = predict(comps.min);
      const errs = stdErrorsAt(comps.min, comps);
      for (let i = 0; i < N; i++) {
        out.push({
          x: comps.min,
          mean: m,
          lower: m - z * errs.seMean,
          upper: m + z * errs.seMean,
          predLower: m - z * errs.sePred,
          predUpper: m + z * errs.sePred
        });
      }
      return out;
    }
    const step = (comps.max - comps.min) / (N - 1);
    for (let i = 0; i < N; i++) {
      const px = i === N - 1 ? comps.max : comps.min + step * i;
      const m = predict(px);
      const errs = stdErrorsAt(px, comps);
      out.push({
        x: px,
        mean: m,
        lower: m - z * errs.seMean,
        upper: m + z * errs.seMean,
        predLower: m - z * errs.sePred,
        predUpper: m + z * errs.sePred
      });
    }
    return out;
  }

  return {
    coef: { a, b },
    predict,
    rSquared: rSquared(data, x, y, meanY, predict),
    evaluateGrid,
    confidenceInterval
  };
}

export default {
  ordinaryLeastSquares,
  visitPoints,
  rSquared,
  regressionLinear
};
