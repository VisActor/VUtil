import { regressionPoints, regressionGrid, regressionBasis, normalizeRegression } from './regression-solver';
import { median } from './median';
import {
  computeLinearCIComponents,
  confidenceCriticalValue,
  confidenceHalfWidth,
  stdErrorsAt
} from './regression-utils';

/**
 * 局部线性 LOWESS。默认全量观测、span=2/3、三次稳健重加权。
 * delta 显式插值加速；maxSamples 仅保留显式选择的历史抽样用途。
 * predict 与 evaluateGrid 查询构建时固定的同一模型，不触发再拟合。
 */
export function regressionLowess(
  data: any[],
  x: (d: any) => number = d => d.x,
  y: (d: any) => number = d => d.y,
  options: {
    span?: number;
    degree?: 1 | 0;
    iterations?: number;
    alpha?: number;
    maxSamples?: number;
    delta?: number;
  } = {}
) {
  const span = options.span ?? 2 / 3;
  const degree = options.degree ?? 1;
  const iterations = options.iterations ?? 3;
  const delta = options.delta ?? 0;
  const alpha = options.alpha ?? 0.05;
  if (
    !(span > 0 && span <= 1) ||
    !Number.isInteger(iterations) ||
    iterations < 0 ||
    !Number.isFinite(delta) ||
    delta < 0 ||
    (degree !== 0 && degree !== 1) ||
    (options.maxSamples != null && (!Number.isInteger(options.maxSamples) || options.maxSamples < 2))
  ) {
    throw new RangeError('Invalid LOWESS span, degree, iterations, delta or maxSamples');
  }
  let pts = regressionPoints(data, x, y).sort((a, b) => a.x - b.x || a.y - b.y);
  if (options.maxSamples != null && pts.length > options.maxSamples) {
    const full = pts;
    const count = options.maxSamples;
    pts = Array.from({ length: count }, (_, i) => full[Math.floor((i * (full.length - 1)) / (count - 1))]);
  }
  const n = pts.length;
  const ptsX = pts.map(p => p.x);
  const ptsY = pts.map(p => p.y);
  const basis = regressionBasis(pts);
  const normalizedX = ptsX.map(v => normalizeRegression(v, basis.xCenter, basis.xScale));
  const normalizedY = ptsY.map(v => normalizeRegression(v, basis.yCenter, basis.yScale));
  const count = Math.min(n, Math.max(2, Math.floor(span * n + 1e-10)));
  let robustWeights: number[] | undefined;

  function exact(x0: number) {
    if (!n) {
      return 0;
    }
    const query = normalizeRegression(x0, basis.xCenter, basis.xScale);
    // 找到连续的最近邻窗口；相等距离选择较小的 x（ties 的 y 已排序）。
    let left = 0;
    let right = n - count;
    while (left < right) {
      const mid = (left + right) >>> 1;
      const lowerDistance = x0 - ptsX[mid];
      const upperDistance = ptsX[mid + count] - x0;
      if (
        Number.isFinite(lowerDistance) && Number.isFinite(upperDistance)
          ? lowerDistance > upperDistance
          : query - normalizedX[mid] > normalizedX[mid + count] - query
      ) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    let start = left;
    let end = left + count;
    if (ptsX[start] === ptsX[end - 1]) {
      while (start > 0 && ptsX[start - 1] === ptsX[start]) {
        start--;
      }
      while (end < n && ptsX[end] === ptsX[start]) {
        end++;
      }
    }
    const rawRadius = Math.max(Math.abs(ptsX[start] - x0), Math.abs(ptsX[end - 1] - x0));
    const scaled = !Number.isFinite(rawRadius);
    const radius = scaled
      ? Math.max(Math.abs(normalizedX[start] - query), Math.abs(normalizedX[end - 1] - query))
      : rawRadius;
    // 局部响应坐标不能由远处、未参与该邻域的观测决定精度。
    let yMin = Infinity;
    let yMax = -Infinity;
    for (let i = start; i < end; i++) {
      yMin = Math.min(yMin, ptsY[i]);
      yMax = Math.max(yMax, ptsY[i]);
    }
    const yCenter = yMin / 2 + yMax / 2;
    const yScale = Math.max(Math.abs(yMin - yCenter), Math.abs(yMax - yCenter)) || 1;
    let sw = 0;
    let sx = 0;
    let sy = 0;
    let sxx = 0;
    let sxy = 0;
    for (let i = start; i < end; i++) {
      const z = radius === 0 ? 0 : (scaled ? normalizedX[i] - query : ptsX[i] - x0) / radius;
      const u = Math.abs(z);
      const t = u >= 1 ? 0 : 1 - u * u * u;
      const w = t * t * t * (robustWeights ? robustWeights[i] : 1);
      sw += w;
      sx += w * z;
      const response = normalizeRegression(ptsY[i], yCenter, yScale);
      sy += w * response;
      sxx += w * z * z;
      sxy += w * z * response;
    }
    if (sw === 0) {
      // 核边界零权重时使用最近有效观测的加权常数；等距离取均值。
      let distance = Infinity;
      let weight = 0;
      let value = 0;
      for (let i = 0; i < n; i++) {
        const w = robustWeights ? robustWeights[i] : 1;
        if (w === 0) {
          continue;
        }
        const d = Math.abs(scaled ? normalizedX[i] - query : ptsX[i] - x0);
        if (d < distance) {
          distance = d;
          weight = w;
          value = ptsY[i];
        } else if (d === distance) {
          value = value * (weight / (weight + w)) + ptsY[i] * (w / (weight + w));
          weight += w;
        }
      }
      if (weight === 0) {
        throw new RangeError('LOWESS has no effective local observations');
      }
      return value;
    }
    const mx = sx / sw;
    const my = sy / sw;
    const variance = sxx / sw - mx * mx;
    const slope = degree === 0 || variance <= Number.EPSILON * 32 ? 0 : (sxy / sw - mx * my) / variance;
    return yCenter + yScale * (my - slope * mx);
  }

  // delta 不删除观测。只减少局部回归求值位置，全部残差参与重加权。
  const anchors: number[] = [];
  for (let i = 0; i < n; ) {
    anchors.push(i);
    if (i === n - 1) {
      break;
    }
    let next = i + 1;
    if (delta > 0) {
      while (next + 1 < n && ptsX[next + 1] - ptsX[i] <= delta) {
        next++;
      }
    }
    // 重复 x 一起使用同一预测；端点不能丢失。
    while (next + 1 < n && ptsX[next + 1] === ptsX[next]) {
      next++;
    }
    i = next;
  }
  let fits = new Array<number>(n);
  function fitObservations() {
    const out = new Array<number>(n);
    for (let a = 0; a < anchors.length; a++) {
      const index = anchors[a];
      out[index] = exact(ptsX[index]);
      if (a === 0) {
        continue;
      }
      const previous = anchors[a - 1];
      const rawWidth = ptsX[index] - ptsX[previous];
      const width = Number.isFinite(rawWidth) ? rawWidth : normalizedX[index] - normalizedX[previous];
      for (let i = previous + 1; i < index; i++) {
        const t =
          width === 0
            ? 0
            : (Number.isFinite(rawWidth) ? ptsX[i] - ptsX[previous] : normalizedX[i] - normalizedX[previous]) / width;
        out[i] = out[previous] * (1 - t) + out[index] * t;
      }
    }
    return out;
  }
  for (let iteration = 0; iteration <= iterations; iteration++) {
    fits = fitObservations();
    if (iteration === iterations) {
      break;
    }
    const residuals = fits.map((v, i) => {
      const residual = ptsY[i] - v;
      return Number.isFinite(residual)
        ? Math.abs(residual / basis.yScale)
        : Math.abs(normalizedY[i] - normalizeRegression(v, basis.yCenter, basis.yScale));
    });
    const med = median(residuals.slice());
    const currentFits = fits;
    robustWeights = residuals.map((r, i) => {
      if (med === 0) {
        const tolerance = Number.EPSILON * 64 * (Math.max(Math.abs(ptsY[i]), Math.abs(currentFits[i])) / basis.yScale);
        return r <= tolerance ? 1 : 0;
      }
      const u = r / (6 * med);
      return u >= 1 ? 0 : (1 - u * u) ** 2;
    });
  }
  function predictSingle(x0: number): number {
    if (delta === 0 || n < 2 || x0 < ptsX[0] || x0 > ptsX[n - 1]) {
      return exact(x0);
    }
    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >>> 1;
      if (ptsX[mid] <= x0) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    if (ptsX[hi] === ptsX[lo]) {
      return fits[lo];
    }
    const width = ptsX[hi] - ptsX[lo];
    const t = Number.isFinite(width)
      ? (x0 - ptsX[lo]) / width
      : (normalizeRegression(x0, basis.xCenter, basis.xScale) - normalizedX[lo]) / (normalizedX[hi] - normalizedX[lo]);
    return fits[lo] * (1 - t) + fits[hi] * t;
  }
  function predict(x0: number | number[]) {
    return Array.isArray(x0) ? x0.map(predictSingle) : predictSingle(x0);
  }
  function evaluateGrid(N: number) {
    return regressionGrid(ptsX[0], ptsX[n - 1], N, predictSingle);
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

    const z = confidenceCriticalValue(alpha);
    if (comps.min === comps.max) {
      const v = predictSingle(comps.min);
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

    const step = (max - min) / (N - 1);
    for (let i = 0; i < N; i++) {
      const px = i === N - 1 ? max : min + step * i;
      const yh = predictSingle(px);
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

  return {
    predict,
    evaluate: predict,
    evaluateGrid,
    confidenceInterval,
    // 节点值按 x 排序，重复观测仍保持其统计权重。
    fitted: pts.map((p, i) => ({ x: p.x, y: fits[i] }))
  };
}
export default regressionLowess;
