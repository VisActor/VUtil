import { randomLCG } from './random';
import { quantileSorted } from './quantileSorted';
import { fitRegression, regressionBasis, regressionPrediction, type RegressionPoint } from './regression-solver';

/** 成对 percentile bootstrap；每次重采样仅拟合一次，固定原始坐标基底。 */
export function regressionBootstrap(
  data: readonly RegressionPoint[],
  options: {
    method: 'linear' | 'polynomial';
    degree?: number;
    grid: readonly number[];
    level: number;
    resamples: number;
    seed: number;
  }
) {
  const degree = options.method === 'linear' ? 1 : options.degree ?? NaN;
  if (
    (options.method !== 'linear' && options.method !== 'polynomial') ||
    !Number.isInteger(degree) ||
    degree < 1 ||
    !data.length ||
    data.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y)) ||
    options.grid.some(x => !Number.isFinite(x)) ||
    !(options.level > 0 && options.level < 1) ||
    !Number.isInteger(options.resamples) ||
    options.resamples < 1 ||
    !Number.isInteger(options.seed) ||
    options.seed < 0 ||
    options.seed > 0xffffffff
  ) {
    throw new RangeError('Invalid paired regression bootstrap inputs');
  }
  if (data.length <= degree + 1) {
    throw new RangeError('Regression bootstrap requires positive residual degrees of freedom');
  }
  const sorted = data.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const basis = regressionBasis(sorted);
  if (fitRegression(sorted, degree, basis).rank < degree + 1) {
    throw new RangeError('Original regression design is rank deficient');
  }
  const random = randomLCG(options.seed);
  const sample = new Array<RegressionPoint>(sorted.length);
  const values = options.grid.map(() => new Array<number>(options.resamples));
  for (let b = 0; b < options.resamples; b++) {
    for (let i = 0; i < sample.length; i++) {
      sample[i] = sorted[Math.floor(random() * sorted.length)];
    }
    const model = fitRegression(sample, degree, basis);
    for (let j = 0; j < options.grid.length; j++) {
      const value = regressionPrediction(model, options.grid[j]);
      if (!Number.isFinite(value)) {
        throw new RangeError('Regression bootstrap prediction is not finite');
      }
      values[j][b] = value;
    }
  }
  const tail = (1 - options.level) / 2;
  return options.grid.map((x, j) => {
    values[j].sort((a, b) => a - b);
    return { x, lower: quantileSorted(values[j], tail), upper: quantileSorted(values[j], 1 - tail) };
  });
}
