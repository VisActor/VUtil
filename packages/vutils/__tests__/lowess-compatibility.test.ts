import { regressionLowess } from '../src/common/regression-lowess';
import { lowessScatterData } from './data/lowess-scatter';

test('scatter LOWESS exposes one robust model, independent of input permutation', () => {
  expect(lowessScatterData).toHaveLength(406);
  const model = regressionLowess(lowessScatterData);
  const reverse = regressionLowess(lowessScatterData.slice().reverse());
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
});
