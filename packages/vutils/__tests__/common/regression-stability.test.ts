import { regressionLinear, regressionPolynomial, regressionLowess } from '../../src';

test('linear predictions retain the slope after a large x translation', () => {
  const data = [0, 1, 2, 3].map(t => ({ x: 1e12 + t, y: 1 + 2 * t }));
  const model = regressionLinear(data);
  expect(model.coef.b).toBeCloseTo(2, 12);
  data.forEach(row => expect(model.predict(row.x)).toBeCloseTo(row.y, 12));
});

test('polynomial predictions use a stable basis after translation', () => {
  const data = [0, 1, 2, 3, 4, 5].map(t => ({ x: 1e9 + t, y: 1 + 2 * t + (t * t) / 2 }));
  const model = regressionPolynomial(data, undefined, undefined, { degree: 2 });
  data.forEach(row => expect(model.predict(row.x)).toBeCloseTo(row.y, 10));
});

test('robust LOWESS queries and its grid describe the same fitted model', () => {
  const data = Array.from({ length: 21 }, (_, x) => ({ x, y: x === 10 ? 100 : x + Math.sin(x) }));
  const model = regressionLowess(data, undefined, undefined, { span: 0.5, iterations: 3 });
  model.evaluateGrid(21).forEach(row => expect(model.predict(row.x)).toBeCloseTo(row.y, 12));
});

test('LOWESS keeps local distances and predictions finite across the numeric range', () => {
  const data = [-1, -0.5, 0, 0.5, 1].map(t => ({ x: t * 1e308, y: t }));
  for (const delta of [0, 1e308]) {
    const model = regressionLowess(data, undefined, undefined, { span: 1, iterations: 0, delta });
    data.forEach(p => expect(model.predict(p.x)).toBeCloseTo(p.y, 12));
    model.evaluateGrid(9).forEach(p => expect(p.y).toBeCloseTo(p.x / 1e308, 12));
  }
});

test('integer categorical index grids remain exact for regression-line consumers', () => {
  const data = Array.from({ length: 24 }, (_, x) => ({ x, y: 1 + x + Math.sin(x) / 5 }));
  for (const model of [
    regressionLinear(data),
    regressionPolynomial(data, undefined, undefined, { degree: 2 }),
    regressionLowess(data)
  ]) {
    expect(model.evaluateGrid(24).map(p => p.x)).toEqual(data.map(p => p.x));
  }
});

test('LOWESS preserves nearby local coordinates when another observation has a much larger scale', () => {
  const data = [0, 1, 2, 3].map(t => ({ x: t * 1e-9, y: t })).concat([{ x: 1e12, y: 4 }]);
  const model = regressionLowess(data, undefined, undefined, { span: 0.6, iterations: 0 });
  data.slice(0, 4).forEach(p => expect(model.predict(p.x)).toBeCloseTo(p.y, 12));
});

test('LOWESS also preserves the local response scale in both exact and interpolated robust models', () => {
  const data = [0, 1, 2, 3].map(t => ({ x: t * 1e-9, y: t * 1e-9 })).concat([{ x: 1e12, y: 1e12 }]);
  for (const iterations of [0, 3]) {
    for (const delta of [0, 1e-9]) {
      const model = regressionLowess(data, undefined, undefined, { span: 0.6, iterations, delta });
      data.slice(0, 4).forEach(p => expect((model.predict(p.x) as number) / 1e-9).toBeCloseTo(p.y / 1e-9, 12));
    }
  }
});
