import { regressionLinear } from '../src/common/regression-linear';
import { regressionLowess } from '../src/common/regression-lowess';
import { regressionLogistic } from '../src/common/regression-logistic';
import { regressionPolynomial } from '../src/common/regression-polynomial';

const noisy = [0, 1, 0, 1, 1, 0, 1, 0].map((y, x) => ({ x, y }));
const keys = ['lower', 'upper', 'predLower', 'predUpper'] as const;
const factories = [
  ['linear', (alpha: number, data = noisy) => regressionLinear(data, undefined, undefined, { alpha })],
  [
    'lowess',
    (alpha: number, data = noisy) => regressionLowess(data, undefined, undefined, { alpha, span: 1, iterations: 0 })
  ],
  ['logistic', (alpha: number, data = noisy) => regressionLogistic(data, undefined, undefined, { alpha })],
  [
    'polynomial',
    (alpha: number, data = noisy) => regressionPolynomial(data, undefined, undefined, { alpha, degree: 1 })
  ]
] as const;

test.each(factories)('%s: tiny alpha gives finite, wider intervals', (_name, make) => {
  const usual = make(0.05).confidenceInterval(3);
  const tiny = make(1e-20).confidenceInterval(3);
  expect(tiny).toHaveLength(3);
  tiny.forEach((row, i) => {
    keys.forEach(key => expect(Number.isFinite(row[key])).toBe(true));
    expect(row.lower).toBeLessThan(usual[i].lower);
    expect(row.upper).toBeGreaterThan(usual[i].upper);
  });
});

test.each(factories)('%s: alpha zero gives unbounded intervals for noisy data', (_name, make) => {
  const interval = make(0).confidenceInterval(3);
  expect(interval).toHaveLength(3);
  interval.forEach(row => {
    expect(row.lower).toBe(-Infinity);
    expect(row.upper).toBe(Infinity);
    expect(row.predLower).toBe(-Infinity);
    expect(row.predUpper).toBe(Infinity);
  });
});

test.each([0, 1e-20])('zero residuals do not produce NaN for alpha %s', alpha => {
  const exact = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 }
  ];
  const interval = regressionLinear(exact, undefined, undefined, { alpha }).confidenceInterval(3);
  expect(interval).toHaveLength(3);
  interval.forEach(row => {
    keys.forEach(key => expect(row[key]).toBe(row.mean));
  });
});

test.each(factories)('%s: alpha one gives zero-width intervals', (_name, make) => {
  const interval = make(1).confidenceInterval(3);
  expect(interval).toHaveLength(3);
  interval.forEach(row => {
    keys.forEach(key => expect(row[key]).toBe(row.mean));
  });
});

test.each(factories)('%s: invalid alpha stays invalid', (_name, make) => {
  [-1, 2, NaN, Infinity, -Infinity].forEach(alpha => {
    const interval = make(alpha).confidenceInterval(3);
    expect(interval).toHaveLength(3);
    interval.forEach(row => {
      keys.forEach(key => expect(row[key]).toBeNaN());
    });
  });
});

test('constant x and zero residuals avoid Infinity times zero', () => {
  const data = [
    { x: 1, y: 2 },
    { x: 1, y: 2 },
    { x: 1, y: 2 }
  ];
  const interval = regressionLinear(data, undefined, undefined, { alpha: 0 }).confidenceInterval(3);
  expect(interval).toHaveLength(3);
  interval.forEach(row => {
    keys.forEach(key => expect(row[key]).toBe(2));
  });
});

test.each(factories)('%s: constant x supports tiny alpha and the zero endpoint', (_name, make) => {
  const data = noisy.map(d => ({ x: 1, y: d.y }));
  const tiny = make(1e-20, data).confidenceInterval(3);
  expect(tiny).toHaveLength(3);
  tiny.forEach(row => {
    keys.forEach(key => expect(Number.isFinite(row[key])).toBe(true));
  });
  const unbounded = make(0, data).confidenceInterval(3);
  expect(unbounded).toHaveLength(3);
  unbounded.forEach(row => {
    expect(row.lower).toBe(-Infinity);
    expect(row.upper).toBe(Infinity);
    expect(row.predLower).toBe(-Infinity);
    expect(row.predUpper).toBe(Infinity);
  });
});

test('default linear interval retains its established numeric value', () => {
  const data = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 2 }
  ];
  const row = regressionLinear(data).confidenceInterval(3)[1];
  expect(row.mean).toBeCloseTo(4 / 3, 12);
  const halfWidth = 1.959963984540054 * Math.sqrt(2 / 9);
  expect(row.lower).toBeCloseTo(4 / 3 - halfWidth, 7);
  expect(row.upper).toBeCloseTo(4 / 3 + halfWidth, 7);
});
