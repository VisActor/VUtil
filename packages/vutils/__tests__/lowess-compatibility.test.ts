import { regressionLowess } from '../src/common/regression-lowess';
import { lowessScatterData } from './data/lowess-scatter';

test.each([
  { options: undefined, expected: { span: 0.3, iterations: 2 } },
  { options: {}, expected: { span: 0.3, iterations: 2 } },
  { options: { span: 0.5 }, expected: { span: 0.5, iterations: 2 } },
  { options: { iterations: 0 }, expected: { span: 0.3, iterations: 0 } }
])('omitted LOWESS parameters retain historical defaults: $options', ({ options, expected }) => {
  const model = regressionLowess(lowessScatterData, undefined, undefined, options);
  const explicit = regressionLowess(lowessScatterData, undefined, undefined, expected);
  expect(model.evaluateGrid(101)).toEqual(explicit.evaluateGrid(101));
  expect(model.confidenceInterval(101)).toEqual(explicit.confidenceInterval(101));
  expect(model.fitted).toEqual(explicit.fitted);
});

test('explicit statsmodels settings retain their fitted result independently of defaults', () => {
  const explicit = regressionLowess(lowessScatterData, undefined, undefined, { span: 2 / 3, iterations: 3 });
  const defaults = regressionLowess(lowessScatterData);
  expect(explicit.predict(0)).toBeCloseTo(256.0314017475166, 10);
  expect(Math.abs((explicit.predict(0) as number) - (defaults.predict(0) as number))).toBeGreaterThan(1);
});

test.each([{}, { span: 2 / 3, iterations: 3 }])(
  'scatter LOWESS exposes one robust model, independent of input permutation: %j',
  options => {
    expect(lowessScatterData).toHaveLength(406);
    const model = regressionLowess(lowessScatterData, undefined, undefined, options);
    const reverse = regressionLowess(lowessScatterData.slice().reverse(), undefined, undefined, options);
    expect(model.fitted).toHaveLength(lowessScatterData.length);
    model.fitted.forEach(row => expect(model.predict(row.x)).toBeCloseTo(row.y, 10));
    const grid = model.evaluateGrid(101);
    const ci = model.confidenceInterval(101);
    const other = reverse.evaluateGrid(101);
    grid.forEach((row, i) => {
      expect(Number.isFinite(row.y)).toBe(true);
      expect(model.predict(row.x)).toBeCloseTo(row.y, 10);
      expect(other[i].y).toBeCloseTo(row.y, 10);
      expect(ci[i].mean).toBeCloseTo(row.y, 10);
      expect(ci[i].lower).toBeLessThanOrEqual(row.y);
      expect(ci[i].upper).toBeGreaterThanOrEqual(row.y);
    });
    // 旧金图分别锁定稳健 grid 与非稳健 predict，是本轮明确修正的错误契约。
  }
);
