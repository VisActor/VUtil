import isNil from './isNil';
import {
  regressionPoints,
  fitRegression,
  regressionPrediction,
  regressionCoefficients,
  regressionGrid
} from './regression-solver';
import {
  computeLinearCIComponents,
  confidenceCriticalValue,
  confidenceHalfWidth,
  stdErrorsAt
} from './regression-utils';

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
  const points = regressionPoints(data, x, y);
  const model = fitRegression(points, 1);
  const coef = regressionCoefficients(model);
  const a = coef[0];
  const b = coef[1];
  const predict = (xx: number) => regressionPrediction(model, xx);
  const comps = computeLinearCIComponents(data, x, y, predict);
  let meanY = 0;
  points.forEach((p, i) => {
    meanY += (p.y - meanY) / (i + 1);
  });

  function evaluateGrid(N: number) {
    return regressionGrid(comps.min, comps.max, N, predict);
  }

  function confidenceInterval(N: number = 50) {
    const out: { x: number; mean: number; lower: number; upper: number; predLower: number; predUpper: number }[] = [];
    if (comps.n === 0 || N <= 0) {
      return out;
    }
    const z = confidenceCriticalValue(alpha);
    if (comps.min === comps.max) {
      const m = predict(comps.min);
      const errs = stdErrorsAt(comps.min, comps);
      const meanHalfWidth = confidenceHalfWidth(z, errs.seMean);
      const predHalfWidth = confidenceHalfWidth(z, errs.sePred);
      for (let i = 0; i < N; i++) {
        out.push({
          x: comps.min,
          mean: m,
          lower: m - meanHalfWidth,
          upper: m + meanHalfWidth,
          predLower: m - predHalfWidth,
          predUpper: m + predHalfWidth
        });
      }
      return out;
    }
    const step = (comps.max - comps.min) / (N - 1);
    for (let i = 0; i < N; i++) {
      const px = i === N - 1 ? comps.max : comps.min + step * i;
      const m = predict(px);
      const errs = stdErrorsAt(px, comps);
      const meanHalfWidth = confidenceHalfWidth(z, errs.seMean);
      const predHalfWidth = confidenceHalfWidth(z, errs.sePred);
      out.push({
        x: px,
        mean: m,
        lower: m - meanHalfWidth,
        upper: m + meanHalfWidth,
        predLower: m - predHalfWidth,
        predUpper: m + predHalfWidth
      });
    }
    return out;
  }

  return {
    coef: { a, b },
    rank: model.rank,
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
