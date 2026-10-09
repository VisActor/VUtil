import { normalQuantile } from '../../src/common/normalQuantile';

test('standard normal quantiles use the existing deterministic approximation', () => {
  expect(normalQuantile(0.5)).toBe(0);
  expect(normalQuantile(0.25)).toBeCloseTo(-0.6744897501960817, 7);
  expect(normalQuantile(0.975)).toBeCloseTo(1.959963984540054, 7);
  for (const p of [1e-12, 0.02424, 0.02425, 0.1, 0.25]) {
    expect(normalQuantile(p)).toBeCloseTo(-normalQuantile(1 - p), p === 1e-12 ? 4 : 7);
  }
});
test('endpoints and invalid probabilities do not return a fabricated median', () => {
  expect(normalQuantile(0)).toBe(-Infinity);
  expect(normalQuantile(1)).toBe(Infinity);
  for (const p of [-1, 2, NaN, Infinity, -Infinity]) {
    expect(normalQuantile(p)).toBeNaN();
  }
});

test('matches scipy 1.13.1 at tails and approximation boundaries', () => {
  const quantiles: [number, number][] = [
    [1e-12, -7.034483825301131],
    [1e-9, -5.9978070150076865],
    [0.02424, -1.9731366119445441],
    [0.02425, -1.972961051311885],
    [0.25, -0.6744897501960817],
    [0.5, 0.0],
    [0.97575, 1.972961051311885],
    [0.97576, 1.9731366119445437],
    [0.999999999, 5.997807019601637],
    [0.999999999999, 7.0344869100478356]
  ];
  for (const [p, expected] of quantiles) {
    expect(Math.abs(normalQuantile(p) - expected)).toBeLessThan(5e-8);
  }
});
