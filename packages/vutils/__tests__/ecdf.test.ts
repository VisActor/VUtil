import ecdf from '../src/common/ecdf';

describe('ecdf', () => {
  test('evaluate single and array and grid', () => {
    const data = [1, 2, 2, 3];
    const e = ecdf(data);
    expect(e.n).toBe(4);
    expect(e.evaluate(2)).toBeCloseTo(3 / 4);
    expect(e.evaluate([0, 2, 4])).toEqual([0, 3 / 4, 1]);
    const g = e.evaluateGrid(5);
    expect(g.length).toBe(5);
    // monotone non-decreasing
    for (let i = 1; i < g.length; i++) {
      expect(g[i].y).toBeGreaterThanOrEqual(g[i - 1].y);
    }
  });

  test('empty and constant data', () => {
    const e0 = ecdf([]);
    expect(e0.n).toBe(0);
    expect(e0.evaluate(1)).toBe(0);
    const e1 = ecdf([5, 5, 5]);
    const g = e1.evaluateGrid(3);
    expect(g.every(p => p.x === 5)).toBeTruthy();
    expect(g.every(c => c.y === 1)).toBeTruthy();
  });

  test('evaluate array and single consistent', () => {
    const data = [3, 1, 4, 1, 5];
    const model = ecdf(data);
    const x = 2;
    const a = model.evaluate(x) as number;
    const b = (model.evaluate([x]) as number[])[0];
    expect(a).toBeCloseTo(b, 12);
  });
});
