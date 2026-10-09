import { bootstrapEstimate, mean } from '../src';
test('bootstrap is seeded, preserves observations and resamples N items', () => {
  const values = Object.freeze([1, 2, 10]);
  const estimator = (sample: readonly number[]) => {
    expect(sample.length).toBe(3);
    return mean(sample)!;
  };
  const a = bootstrapEstimate(values, estimator, { resamples: 100, seed: 0 });
  expect(a).toEqual(bootstrapEstimate(values, estimator, { resamples: 100, seed: 0 }));
  expect(a).not.toEqual(bootstrapEstimate(values, estimator, { resamples: 100, seed: 1 }));
  expect(bootstrapEstimate([2, 2], sample => mean(sample)!, { resamples: 3, seed: 0 })).toEqual([2, 2, 2]);
  expect(() => bootstrapEstimate([], estimator, { resamples: 100, seed: 0 })).toThrow(RangeError);
});

test.each([
  { resamples: 0, seed: 1 },
  { resamples: 1.5, seed: 1 },
  { resamples: Infinity, seed: 1 },
  { resamples: 2, seed: -1 },
  { resamples: 2, seed: 0x100000000 },
  { resamples: 2, seed: 0.5 },
  { resamples: 2, seed: NaN }
])('bootstrap rejects invalid options: %j', options => {
  expect(() => bootstrapEstimate([1, 2], sample => mean(sample)!, options)).toThrow(RangeError);
});

test.each([NaN, Infinity, -Infinity])('bootstrap rejects non-finite observations and estimates: %s', value => {
  const options = { resamples: 3, seed: 1 };
  expect(() => bootstrapEstimate([1, value], sample => mean(sample)!, options)).toThrow(RangeError);
  expect(() => bootstrapEstimate([1, 2], () => value, options)).toThrow(RangeError);
});

test('bootstrap uses source observations and accepts the maximum uint32 seed', () => {
  const observations = Object.freeze([3, 7, 11]);
  const estimates = bootstrapEstimate(observations, sample => sample[0], { resamples: 100, seed: 0xffffffff });
  expect(estimates).toHaveLength(100);
  expect(estimates.every(value => observations.includes(value))).toBe(true);
});
