import { randomLCG } from './random';
/** 有放回重采样；回调不得修改或持有复用的只读样本缓冲区。 */
export function bootstrapEstimate(
  values: readonly number[],
  estimator: (sample: readonly number[]) => number,
  options: { resamples: number; seed: number }
): number[] {
  if (
    !values.length ||
    values.some(value => !Number.isFinite(value)) ||
    !Number.isInteger(options.resamples) ||
    options.resamples < 1 ||
    !Number.isInteger(options.seed) ||
    options.seed < 0 ||
    options.seed > 0xffffffff
  ) {
    throw new RangeError('bootstrap requires finite observations, positive resamples and a uint32 seed');
  }
  const random = randomLCG(options.seed);
  const sample = new Array<number>(values.length);
  const estimates = new Array<number>(options.resamples);
  for (let b = 0; b < options.resamples; b++) {
    for (let i = 0; i < sample.length; i++) {
      sample[i] = values[Math.floor(random() * values.length)];
    }
    const estimate = estimator(sample);
    if (!Number.isFinite(estimate)) {
      throw new RangeError('bootstrap estimator must return a finite number');
    }
    estimates[b] = estimate;
  }
  return estimates;
}
