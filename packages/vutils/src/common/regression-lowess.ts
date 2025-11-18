import { visitPoints } from './regression-linear';
import { computeLinearCIComponents, invNorm, stdErrorsAt } from './regression-utils';

function tricube(u: number) {
  const uu = Math.abs(u);
  if (uu >= 1) {
    return 0;
  }
  const t = 1 - uu * uu * uu;
  return t * t * t;
}

/**
 * Simple lowess implementation (univariate x)
 * options:
 * - span: fraction of points used in local regression (0,1]
 * - degree: 0 (constant) or 1 (linear)
 * - iterations: number of robustifying iterations
 */
export function regressionLowess(
  data: any[],
  x: (d: any) => number = d => d.x,
  y: (d: any) => number = d => d.y,
  options: { span?: number; degree?: 1 | 0; iterations?: number; alpha?: number } = {}
) {
  const span = options.span || 0.3;
  const degree = options.degree === 0 ? 0 : 1;
  const alpha = options?.alpha ?? 0.05;
  const iterations = options.iterations == null ? 2 : options.iterations;

  const ptsX: number[] = [];
  const ptsY: number[] = [];
  visitPoints(data, x, y, (dx, dy) => {
    ptsX.push(dx);
    ptsY.push(dy);
  });

  const n = ptsX.length;
  function predictSingle(x0: number, robustWeights?: number[]) {
    if (n === 0) {
      return 0;
    }
    // compute distances and select nearest m points
    const dists: { idx: number; dist: number }[] = [];
    for (let i = 0; i < n; i++) {
      dists.push({ idx: i, dist: Math.abs(ptsX[i] - x0) });
    }
    dists.sort((a, b) => a.dist - b.dist);
    const m = Math.max(2, Math.min(n, Math.floor(span * n)));
    const maxDist = dists[m - 1].dist || 0;

    // compute weights
    const w: number[] = new Array(m);
    let sumw = 0;
    for (let i = 0; i < m; i++) {
      const idx = dists[i].idx;
      const u = maxDist === 0 ? 0 : dists[i].dist / maxDist;
      let wi = tricube(u);
      if (robustWeights && robustWeights[idx] != null) {
        wi *= robustWeights[idx];
      }
      w[i] = wi;
      sumw += wi;
    }

    if (sumw === 0) {
      // fallback to nearest y
      return ptsY[dists[0].idx];
    }

    if (degree === 0) {
      let s = 0;
      for (let i = 0; i < m; i++) {
        s += w[i] * ptsY[dists[i].idx];
      }
      return s / sumw;
    }

    // weighted linear regression on local points
    let sw = 0;
    let sx = 0;
    let sy = 0;
    let sxx = 0;
    let sxy = 0;
    for (let i = 0; i < m; i++) {
      const idx = dists[i].idx;
      const xi = ptsX[idx];
      const yi = ptsY[idx];
      const wi = w[i];
      sw += wi;
      sx += wi * xi;
      sy += wi * yi;
      sxx += wi * xi * xi;
      sxy += wi * xi * yi;
    }

    const meanX = sx / sw;
    const meanY = sy / sw;
    const denom = sxx - sx * meanX;
    const slope = Math.abs(denom) < 1e-12 ? 0 : (sxy - sx * meanY) / denom;
    const intercept = meanY - slope * meanX;
    return intercept + slope * x0;
  }

  function predict(x0: number | number[]) {
    if (Array.isArray(x0)) {
      const out: number[] = [];
      for (let i = 0; i < x0.length; i++) {
        out.push(predictSingle(x0[i]));
      }
      return out;
    }
    return predictSingle(x0 as number);
  }

  function evaluateGrid(N: number) {
    const out: { x: number; y: number }[] = [];
    if (N <= 0) {
      return out;
    }
    if (n === 0) {
      return out;
    }
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; i++) {
      if (ptsX[i] < min) {
        min = ptsX[i];
      }
      if (ptsX[i] > max) {
        max = ptsX[i];
      }
    }
    if (min === max) {
      const v = predictSingle(min);
      for (let i = 0; i < N; i++) {
        out.push({ x: min, y: v });
      }
      return out;
    }
    const step = (max - min) / (N - 1);

    // optionally add robust iterations
    let robustWeights: number[] | undefined;
    for (let iter = 0; iter < iterations; iter++) {
      // compute fits
      const fits: number[] = [];
      for (let i = 0; i < n; i++) {
        fits.push(predictSingle(ptsX[i], robustWeights));
      }
      // compute residuals
      const res: number[] = [];
      for (let i = 0; i < n; i++) {
        res.push(Math.abs(ptsY[i] - fits[i]));
      }
      // median absolute deviation
      const sortedRes = res.slice().sort((a, b) => a - b);
      const med = sortedRes[Math.floor(n / 2)] || 0;
      robustWeights = new Array(n);
      for (let i = 0; i < n; i++) {
        const u = med === 0 ? 0 : res[i] / (6 * med);
        const w = Math.abs(u) >= 1 ? 0 : (1 - u * u) * (1 - u * u);
        robustWeights[i] = w;
      }
    }

    for (let i = 0; i < N; i++) {
      const px = i === N - 1 ? max : min + step * i;
      out.push({ x: px, y: predictSingle(px, robustWeights) });
    }
    return out;
  }

  function confidenceInterval(N: number = 50) {
    const out: { x: number; mean: number; lower: number; upper: number; predLower: number; predUpper: number }[] = [];

    if (N <= 0) {
      return out;
    }
    if (n === 0) {
      return out;
    }

    // use data x-range
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; i++) {
      if (ptsX[i] < min) {
        min = ptsX[i];
      }
      if (ptsX[i] > max) {
        max = ptsX[i];
      }
    }
    if (min === Infinity || max === -Infinity) {
      return out;
    }

    const comps = computeLinearCIComponents(data, x, y, (xx: number) => predictSingle(xx));
    if (comps.n === 0) {
      return out;
    }

    const z = Math.abs(invNorm(1 - alpha / 2));
    if (comps.min === comps.max) {
      const v = predictSingle(comps.min);
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

    const step = (max - min) / (N - 1);
    for (let i = 0; i < N; i++) {
      const px = i === N - 1 ? max : min + step * i;
      const yh = predictSingle(px);
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
    predict,
    evaluate: predict as any,
    evaluateGrid,
    confidenceInterval
  };
}

export default regressionLowess;
