import { regressionBootstrap, regressionPolynomial, regressionLowess } from '../../src';

test('paired resampling retains a perfect linear relation, including deficient resamples', () => {
  const data = [0, 1, 2, 3].map(x => ({ x, y: 4 * x + 3 }));
  const options = { method: 'linear' as const, grid: [0, 1, 2, 3], level: 0.8, resamples: 1000, seed: 0 };
  const interval = regressionBootstrap(data, options);
  interval.forEach((p, i) => {
    expect(p.lower).toBeCloseTo(data[i].y, 10);
    expect(p.upper).toBeCloseTo(data[i].y, 10);
  });
  expect(regressionBootstrap(data.slice().reverse(), options)).toEqual(interval);
  expect(data).toEqual([0, 1, 2, 3].map(x => ({ x, y: 4 * x + 3 })));
});

test('polynomial rank and minimum norm predictions are defined without zero coefficient fallback', () => {
  const model = regressionPolynomial(
    [
      { x: 1, y: 2 },
      { x: 1, y: 4 }
    ],
    undefined,
    undefined,
    { degree: 2 }
  );
  expect(model.rank).toBe(1);
  expect(model.predict(1)).toBeCloseTo(3, 12);
});

test('paired polynomial intervals are deterministic, finite and reject inadequate original designs', () => {
  const data = [0, 1, 2, 3, 4, 5].map(x => ({ x, y: x * x + Math.sin(x) }));
  const options = { method: 'polynomial' as const, degree: 2, grid: [0, 2, 5], level: 0.95, resamples: 100, seed: 4 };
  const interval = regressionBootstrap(data, options);
  expect(regressionBootstrap(data, options)).toEqual(interval);
  interval.forEach(p => {
    expect(Number.isFinite(p.lower)).toBe(true);
    expect(p.upper).toBeGreaterThanOrEqual(p.lower);
  });
  expect(() => regressionBootstrap(data.slice(0, 3), options)).toThrow(/degrees of freedom/);
  expect(() =>
    regressionBootstrap(
      data.map(p => ({ ...p, x: 0 })),
      options
    )
  ).toThrow(/rank deficient/);
  expect(() => regressionBootstrap(data, { ...options, seed: -1 })).toThrow(RangeError);
});

test('LOWESS retains every observation by default and delta queries share node predictions', () => {
  const data = Array.from({ length: 1200 }, (_, x) => ({ x, y: 2 * x + Math.sin(x / 30) }));
  const exact = regressionLowess(data, undefined, undefined, { iterations: 0 });
  expect(exact.fitted).toHaveLength(1200);
  const model = regressionLowess(data, undefined, undefined, { delta: 12 });
  model.fitted.forEach(row => expect(model.predict(row.x)).toBeCloseTo(row.y, 10));
  model.evaluateGrid(21).forEach(row => expect(model.predict(row.x)).toBe(row.y));
  expect(() => regressionLowess(data, undefined, undefined, { span: 0 })).toThrow(RangeError);
});
