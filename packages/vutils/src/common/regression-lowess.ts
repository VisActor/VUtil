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
 * Stratified sampling to reduce data size while preserving distribution
 */
function stratifiedSample(sortedData: { x: number; y: number }[], maxSamples: number) {
  const n = sortedData.length;
  if (n <= maxSamples) {
    return sortedData;
  }

  const sampled: { x: number; y: number }[] = [];

  // More aggressive sampling - use exact step size
  const step = n / maxSamples;

  for (let i = 0; i < maxSamples; i++) {
    const idx = Math.min(Math.floor(i * step), n - 1);
    sampled.push(sortedData[idx]);
  }

  return sampled;
}

/**
 * Simple lowess implementation (univariate x)
 * options:
 * - span: fraction of points used in local regression (0,1]
 * - degree: 0 (constant) or 1 (linear)
 * - iterations: number of robustifying iterations
 * - alpha: confidence level for CI
 * - maxSamples: maximum number of points to use (default: 1000 for fast processing)
 */
export function regressionLowess(
  data: any[],
  x: (d: any) => number = d => d.x,
  y: (d: any) => number = d => d.y,
  options: { span?: number; degree?: 1 | 0; iterations?: number; alpha?: number; maxSamples?: number } = {}
) {
  const span = options.span || 0.3;
  const degree = options.degree === 0 ? 0 : 1;
  const alpha = options.alpha ?? 0.05;
  const iterations = options.iterations == null ? 2 : options.iterations;
  const maxSamples = options.maxSamples || 1000;

  // Collect and sort data by x
  const rawPoints: { x: number; y: number }[] = [];
  visitPoints(data, x, y, (dx, dy) => {
    rawPoints.push({ x: dx, y: dy });
  });

  rawPoints.sort((a, b) => a.x - b.x);

  // Apply sampling if needed
  const sampledPoints = stratifiedSample(rawPoints, maxSamples);

  const n = sampledPoints.length;
  const ptsX: number[] = new Array(n);
  const ptsY: number[] = new Array(n);

  for (let i = 0; i < n; i++) {
    ptsX[i] = sampledPoints[i].x;
    ptsY[i] = sampledPoints[i].y;
  }

  /**
   * Optimized predictSingle using binary search on pre-sorted data
   */
  function predictSingle(x0: number, robustWeights?: number[]) {
    if (n === 0) {
      return 0;
    }

    // Binary search to find insertion point
    let left = 0;
    let right = n;
    while (left < right) {
      const mid = (left + right) >> 1;
      if (ptsX[mid] < x0) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    const m = Math.max(2, Math.min(n, Math.floor(span * n)));

    // Calculate range around insertion point
    const start = Math.max(0, left - Math.floor(m / 2));
    const end = Math.min(n, start + m);
    const actualStart = Math.max(0, end - m);

    // Find max distance and compute weights in single pass
    let maxDist = 0;
    const windowSize = end - actualStart;
    const distances: number[] = new Array(windowSize);

    for (let i = actualStart; i < end; i++) {
      const dist = Math.abs(ptsX[i] - x0);
      distances[i - actualStart] = dist;
      if (dist > maxDist) {
        maxDist = dist;
      }
    }

    // Compute weights using pre-calculated distances
    let sumw = 0;
    const w: number[] = new Array(windowSize);
    for (let i = 0; i < windowSize; i++) {
      const u = maxDist === 0 ? 0 : distances[i] / maxDist;
      let wi = tricube(u);
      if (robustWeights && robustWeights[actualStart + i] != null) {
        wi *= robustWeights[actualStart + i];
      }
      w[i] = wi;
      sumw += wi;
    }

    if (sumw === 0) {
      // fallback to nearest y
      const nearestIdx = left < n ? left : n - 1;
      return ptsY[nearestIdx];
    }

    if (degree === 0) {
      let s = 0;
      for (let i = 0; i < w.length; i++) {
        s += w[i] * ptsY[actualStart + i];
      }
      return s / sumw;
    }

    // weighted linear regression on local points
    let sw = 0;
    let sx = 0;
    let sy = 0;
    let sxx = 0;
    let sxy = 0;
    for (let i = actualStart; i < end; i++) {
      const idx = i - actualStart;
      const xi = ptsX[i];
      const yi = ptsY[i];
      const wi = w[idx];
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
      const len = x0.length;
      const out: number[] = new Array(len);
      for (let i = 0; i < len; i++) {
        out[i] = predictSingle(x0[i]);
      }
      return out;
    }
    return predictSingle(x0 as number);
  }

  function evaluateGrid(N: number) {
    if (N <= 0) {
      return [];
    }
    if (n === 0) {
      return [];
    }

    const out: { x: number; y: number }[] = new Array(N);
    const min = ptsX[0];
    const max = ptsX[n - 1];

    if (min === max) {
      const v = predictSingle(min);
      for (let i = 0; i < N; i++) {
        out[i] = { x: min, y: v };
      }
      return out;
    }
    const step = (max - min) / (N - 1);

    // optionally add robust iterations
    let robustWeights: number[] | undefined;

    // Disable robustness iterations for large datasets to improve performance
    // Users can override by setting iterations explicitly
    const effectiveIterations = options.iterations != null ? iterations : n > 500 ? 0 : iterations;

    if (effectiveIterations > 0) {
      for (let iter = 0; iter < effectiveIterations; iter++) {
        // compute fits - pre-allocate arrays
        const fits: number[] = new Array(n);
        const res: number[] = new Array(n);

        for (let i = 0; i < n; i++) {
          fits[i] = predictSingle(ptsX[i], robustWeights);
          res[i] = Math.abs(ptsY[i] - fits[i]);
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
    }

    for (let i = 0; i < N; i++) {
      const px = i === N - 1 ? max : min + step * i;
      out[i] = { x: px, y: predictSingle(px, robustWeights) };
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

    // use data x-range (already sorted)
    const min = ptsX[0];
    const max = ptsX[n - 1];

    if (min === undefined || max === undefined || min === Infinity || max === -Infinity) {
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
