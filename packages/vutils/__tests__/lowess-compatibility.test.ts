import { regressionLowess } from '../src/common/regression-lowess';
import { lowessScatterData, expectedGrid, expectedCI } from './data/lowess-scatter';

function expectNear(actual: number, expected: number) {
  expect(Number.isFinite(actual)).toBe(true);
  expect(Math.abs(actual - expected)).toBeLessThan(1e-8);
}

test('preserves the scatter LOWESS curve and confidence intervals', () => {
  expect(lowessScatterData).toHaveLength(406);
  const model = regressionLowess(lowessScatterData);
  const grid = model.evaluateGrid(101);
  const ci = model.confidenceInterval(101);
  expect(grid).toHaveLength(101);
  expect(ci).toHaveLength(101);
  grid.forEach((point, i) => {
    expectNear(point.x, expectedGrid[i].x);
    expectNear(point.y, expectedGrid[i].y);
  });
  const keys = ['x', 'mean', 'lower', 'upper', 'predLower', 'predUpper'] as const;
  ci.forEach((point, i) => {
    keys.forEach(key => expectNear(point[key], expectedCI[i][key]));
  });
  // predict and CI use the non-robust fit; evaluateGrid uses robust iterations.
  const predicted = model.predict(expectedCI.map(point => point.x)) as number[];
  predicted.forEach((value, i) => expectNear(value, expectedCI[i].mean));
});
