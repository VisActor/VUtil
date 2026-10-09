import { visitPoints, rSquared } from './regression-linear';
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

export function regressionPolynomial(
  data: any[],
  x: (d: any) => number = d => d.x,
  y: (d: any) => number = d => d.y,
  options: { degree?: number; alpha?: number } = {}
) {
  const degree = options.degree ?? 0;
  if (!Number.isInteger(degree) || degree < 0) {
    throw new RangeError('Polynomial degree must be an nonnegative integer');
  }
  const alpha = options.alpha ?? 0.05;
  const points = regressionPoints(data, x, y);
  const model = fitRegression(points, degree);
  const coef = regressionCoefficients(model);
  const predict = (xx: number) => regressionPrediction(model, xx);

  return {
    degree,
    rank: model.rank,
    coef,
    predict,
    rSquared: rSquared(
      data,
      x,
      y,
      (() => {
        // compute mean y
        let sum = 0;
        let cnt = 0;
        visitPoints(data, x, y, (_dx, dy) => {
          sum += dy;
          cnt++;
        });
        return cnt === 0 ? 0 : sum / cnt;
      })(),
      predict
    ),
    evaluateGrid(N: number) {
      let min = Infinity;
      let max = -Infinity;
      points.forEach(p => {
        min = Math.min(min, p.x);
        max = Math.max(max, p.x);
      });
      return regressionGrid(min, max, N, predict);
    },
    confidenceInterval(N: number = 50) {
      const out: { x: number; mean: number; lower: number; upper: number; predLower: number; predUpper: number }[] = [];

      if (N <= 0) {
        return out;
      }

      const comps = computeLinearCIComponents(data, x, y, predict);
      if (comps.n === 0) {
        return out;
      }

      const z = confidenceCriticalValue(alpha);
      if (comps.min === comps.max) {
        const v = predict(comps.min);
        const errs = stdErrorsAt(comps.min, comps);
        const meanHalfWidth = confidenceHalfWidth(z, errs.seMean);
        const predHalfWidth = confidenceHalfWidth(z, errs.sePred);
        for (let i = 0; i < N; i++) {
          out.push({
            x: comps.min,
            mean: v,
            lower: v - meanHalfWidth,
            upper: v + meanHalfWidth,
            predLower: v - predHalfWidth,
            predUpper: v + predHalfWidth
          });
        }
        return out;
      }

      const step = (comps.max - comps.min) / (N - 1);
      for (let i = 0; i < N; i++) {
        const px = i === N - 1 ? comps.max : comps.min + step * i;
        const yh = predict(px);
        const errs = stdErrorsAt(px, comps);
        const meanHalfWidth = confidenceHalfWidth(z, errs.seMean);
        const predHalfWidth = confidenceHalfWidth(z, errs.sePred);
        out.push({
          x: px,
          mean: yh,
          lower: yh - meanHalfWidth,
          upper: yh + meanHalfWidth,
          predLower: yh - predHalfWidth,
          predUpper: yh + predHalfWidth
        });
      }
      return out;
    }
  };
}

export default regressionPolynomial;
