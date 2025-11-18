import { visitPoints } from './regression-linear';
import { computeLinearCIComponents, invNorm, stdErrorsAt } from './regression-utils';

/**
 * Simple logistic regression (binary) using Newton-Raphson (IRLS).
 * Returns { coef, predict, evaluateGrid }
 * - coef: [intercept, beta]
 * - predict(x): probability p(y=1|x)
 */
export function regressionLogistic(
  data: any[],
  x: (d: any) => number = d => d.x,
  y: (d: any) => number = d => d.y,
  options?: { maxIteration?: number; tol?: number; alpha?: number }
) {
  const maxIter = options?.maxIteration ?? 25;
  const tol = options?.tol ?? 1e-6;
  const alpha = options?.alpha ?? 0.05;
  // build arrays
  const xs: number[] = [];
  const ys: number[] = [];
  visitPoints(data, x, y, (dx, dy) => {
    xs.push(dx);
    ys.push(dy ? 1 : 0);
  });

  const n = xs.length;
  if (n === 0) {
    return {
      coef: [0, 0],
      predict: (_x: number) => 0,
      evaluateGrid: (N: number) => [] as { x: number; y: number }[],
      confidenceInterval: (N: number = 50) =>
        [] as { x: number; mean: number; lower: number; upper: number; predLower: number; predUpper: number }[]
    };
  }

  // initial coef via linear regression rough guess
  let intercept = 0;
  let beta = 0;

  for (let iter = 0; iter < maxIter; iter++) {
    const p: number[] = new Array(n);
    let converged = true;
    for (let i = 0; i < n; i++) {
      const z = intercept + beta * xs[i];
      const pi = 1 / (1 + Math.exp(-z));
      p[i] = pi;
    }

    // compute gradient and hessian
    let g0 = 0;
    let g1 = 0;
    let h00 = 0;
    let h01 = 0;
    let h11 = 0;
    for (let i = 0; i < n; i++) {
      const wi = p[i] * (1 - p[i]);
      const diff = ys[i] - p[i];
      g0 += diff;
      g1 += diff * xs[i];
      h00 += wi;
      h01 += wi * xs[i];
      h11 += wi * xs[i] * xs[i];
    }

    // solve 2x2 system H * delta = g
    const det = h00 * h11 - h01 * h01;
    if (Math.abs(det) < 1e-12) {
      break;
    }
    const delta0 = (h11 * g0 - h01 * g1) / det;
    const delta1 = (-h01 * g0 + h00 * g1) / det;

    intercept += delta0;
    beta += delta1;

    if (Math.abs(delta0) > tol || Math.abs(delta1) > tol) {
      converged = false;
    }
    if (converged) {
      break;
    }
  }

  const predict = (xx: number) => {
    const z = intercept + beta * xx;
    return 1 / (1 + Math.exp(-z));
  };

  function evaluateGrid(N: number) {
    const out: { x: number; y: number }[] = [];
    if (N <= 0) {
      return out;
    }
    let min = Infinity;
    let max = -Infinity;
    visitPoints(data, x, y, dx => {
      if (dx < min) {
        min = dx;
      }
      if (dx > max) {
        max = dx;
      }
    });
    if (min === Infinity || max === -Infinity) {
      return out;
    }
    if (min === max) {
      const v = predict(min);
      for (let i = 0; i < N; i++) {
        out.push({ x: min, y: v });
      }
      return out;
    }
    const step = (max - min) / (N - 1);
    for (let i = 0; i < N; i++) {
      const px = i === N - 1 ? max : min + step * i;
      out.push({ x: px, y: predict(px) });
    }
    return out;
  }

  function confidenceInterval(N: number = 50) {
    const out: { x: number; mean: number; lower: number; upper: number; predLower: number; predUpper: number }[] = [];

    if (N <= 0) {
      return out;
    }

    const comps = computeLinearCIComponents(data, x, y, predict);
    if (comps.n === 0) {
      return out;
    }

    const z = Math.abs(invNorm(1 - alpha / 2));
    if (comps.min === comps.max) {
      const v = predict(comps.min);
      const errs = stdErrorsAt(comps.min, comps);
      for (let i = 0; i < N; i++) {
        out.push({
          x: comps.min,
          mean: v,
          lower: v - z * errs.seMean,
          upper: v + z * errs.seMean,
          predLower: v - z * errs.sePred,
          predUpper: v + z * errs.sePred
        });
      }
      return out;
    }

    const step = (comps.max - comps.min) / (N - 1);
    for (let i = 0; i < N; i++) {
      const px = i === N - 1 ? comps.max : comps.min + step * i;
      const yh = predict(px);
      const errs = stdErrorsAt(px, comps);
      out.push({
        x: px,
        mean: yh,
        lower: yh - z * errs.seMean,
        upper: yh + z * errs.seMean,
        predLower: yh - z * errs.sePred,
        predUpper: yh + z * errs.sePred
      });
    }
    return out;
  }

  return {
    coef: [intercept, beta],
    predict,
    evaluateGrid,
    confidenceInterval
  };
}

export default regressionLogistic;
