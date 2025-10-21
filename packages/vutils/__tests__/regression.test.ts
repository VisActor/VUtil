import { regressionLinear } from '../src/common/regression-linear';
import { regressionLowess } from '../src/common/regression-lowess';
import { regressionLogistic } from '../src/common/regression-logistic';
import { regressionPolynomial } from '../src/common/regression-polynomial';

describe('regressions', () => {
  const sample = [] as any[];
  for (let i = 0; i < 100; i++) {
    const x = i / 2;
    const y = 150 - 1.2 * x + (Math.random() - 0.5) * 10;
    sample.push({ x, y });
  }

  test('linear evaluateGrid and confidenceInterval shapes', () => {
    const m = regressionLinear(sample);
    const g = m.evaluateGrid(20);
    expect(Array.isArray(g)).toBeTruthy();
    expect(g.length).toBe(20);
    const ci = m.confidenceInterval(20);
    expect(Array.isArray(ci)).toBeTruthy();
    expect(ci.length).toBe(20);
    expect(ci[0]).toHaveProperty('x');
    expect(ci[0]).toHaveProperty('mean');
    expect(ci[0]).toHaveProperty('lower');
    expect(ci[0]).toHaveProperty('upper');
  });

  test('lowess evaluateGrid and confidenceInterval shapes', () => {
    const m = regressionLowess(
      sample,
      d => d.x,
      d => d.y,
      { span: 0.3, degree: 1, iterations: 2 }
    );
    const g = m.evaluateGrid(30);
    expect(Array.isArray(g)).toBeTruthy();
    expect(g.length).toBe(30);
    const ci = m.confidenceInterval(30);
    expect(Array.isArray(ci)).toBeTruthy();
    expect(ci.length).toBe(30);
    expect(ci[0]).toHaveProperty('x');
    expect(ci[0]).toHaveProperty('mean');
  });

  test('logistic evaluateGrid and confidenceInterval shapes (binary y)', () => {
    const bin: any[] = [];
    for (let i = 0; i < 100; i++) {
      const x = i / 10;
      const prob = 1 / (1 + Math.exp(-(-2 + 0.1 * x)));
      bin.push({ x, y: Math.random() < prob ? 1 : 0 });
    }
    const m = regressionLogistic(
      bin,
      d => d.x,
      d => d.y
    );
    const g = m.evaluateGrid(25);
    expect(g.length).toBe(25);
    const ci = m.confidenceInterval(25);
    expect(ci.length).toBe(25);
    expect(ci[0]).toHaveProperty('x');
    expect(ci[0]).toHaveProperty('mean');
  });

  test('polynomial evaluateGrid and confidenceInterval shapes', () => {
    const m = regressionPolynomial(
      sample,
      d => d.x,
      d => d.y,
      { degree: 2 }
    );
    const g = m.evaluateGrid(15);
    expect(g.length).toBe(15);
    const ci = m.confidenceInterval(15);
    expect(ci.length).toBe(15);
    expect(ci[0]).toHaveProperty('x');
    expect(ci[0]).toHaveProperty('mean');
  });
});
