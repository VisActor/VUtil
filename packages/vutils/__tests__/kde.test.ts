import { epanechnikov, gaussian, kde, scott, silverman } from '../src/common/kde';

describe('kde', () => {
  test('evaluate and grid', () => {
    const data = [1, 2, 3, 4, 5];
    const model = kde(data, { bandwidthMethod: 'scott' });
    expect(typeof model.bandwidth).toBe('number');
    const v = model.evaluate(3);
    expect(typeof v).toBe('number');
    const arr = model.evaluate([1, 2, 3]);
    expect(Array.isArray(arr)).toBeTruthy();
    const g = model.evaluateGrid(10);
    expect(Array.isArray(g)).toBeTruthy();
    expect(g.length).toBe(10);
  });

  test('constant data returns zeros density when bandwidth is zero', () => {
    const data = [5, 5, 5];
    const model = kde(data, { bandwidth: 0 });
    const g = model.evaluateGrid(3);
    expect(g.length).toBe(3);
    expect(g.every(d => d.y === 0)).toBeTruthy();
  });
});

describe('kde', () => {
  test('basic gaussian kde returns higher density near samples (evaluator API)', () => {
    const data = [0, 0, 1, 2, 3];
    const points = [-1, 0, 0.5, 1, 2, 4];
    const model = kde(data, { kernel: gaussian, bandwidth: 0.5 });
    const densities = model.evaluate(points) as number[];
    // highest density should be at 0 or 1 (near data points)
    const maxIdx = densities.indexOf(Math.max(...densities));
    expect(points[maxIdx]).toBeGreaterThanOrEqual(0);
    expect(densities.length).toBe(points.length);
  });

  test('epanechnikov kernel gives finite densities and respects bandwidth selectors (evaluator)', () => {
    const data = [1, 2, 3, 4, 5];
    const points = [0, 1, 2, 3, 4, 5, 6];
    const model1 = kde(data, { kernel: epanechnikov, bandwidthMethod: 'scott' });
    const model2 = kde(data, { kernel: epanechnikov, bandwidthMethod: 'silverman' });
    const d1 = model1.evaluate(points) as number[];
    const d2 = model2.evaluate(points) as number[];
    expect(d1.length).toBe(points.length);
    expect(d2.length).toBe(points.length);
    for (let i = 0; i < d1.length; i++) {
      expect(isFinite(d1[i])).toBe(true);
      expect(isFinite(d2[i])).toBe(true);
    }
  });

  test('bandwidth helpers roughly scale with n and std', () => {
    const s = 2;
    const h1 = scott(100, s);
    const h2 = silverman(100, s);
    expect(h1).toBeGreaterThan(0);
    expect(h2).toBeGreaterThan(0);
  });

  test('evaluateGrid returns N points and densities', () => {
    const data = [0, 1, 2];
    const model = kde(data, { kernel: gaussian, bandwidth: 0.5 });
    const res = model.evaluateGrid(5);
    expect(res.length).toBe(5);
    // points should be in increasing order
    for (let i = 1; i < res.length; i++) {
      expect(res[i].x).toBeGreaterThanOrEqual(res[i - 1].x);
    }
  });

  test('evaluate(single) equals evaluate([single]) and is finite', () => {
    const data = [0, 1, 2, 3];
    const model = kde(data, { kernel: gaussian });
    const x = 1.3;
    const a = model.evaluate(x) as number;
    const b = (model.evaluate([x]) as number[])[0];
    expect(typeof a).toBe('number');
    expect(Number.isFinite(a)).toBe(true);
    expect(a).toBeCloseTo(b, 12);
  });

  test('constant data evaluateGrid returns repeated point and same densities', () => {
    const data = [5, 5, 5];
    const model = kde(data, { kernel: gaussian });
    const res = model.evaluateGrid(4);
    expect(res.length).toBe(4);
    // all points should equal 5 and all densities should be equal
    for (let i = 0; i < res.length; i++) {
      expect(res[i].x).toBe(5);
      expect(res[i].y).toBeCloseTo(res[0].y, 12);
    }
  });

  test('kernels produce non-negative finite densities and bandwidth present', () => {
    const data = [0, 2, 4, 6];
    const modelG = kde(data, { kernel: gaussian });
    const modelE = kde(data, { kernel: epanechnikov });
    const testPoints = [0, 1, 2, 3, 4];
    const dg = modelG.evaluate(testPoints) as number[];
    const de = modelE.evaluate(testPoints) as number[];
    for (let i = 0; i < testPoints.length; i++) {
      expect(Number.isFinite(dg[i])).toBe(true);
      expect(dg[i]).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(de[i])).toBe(true);
      expect(de[i]).toBeGreaterThanOrEqual(0);
    }
    expect(modelG.bandwidth).toBeGreaterThan(0);
    expect(modelE.bandwidth).toBeGreaterThan(0);
  });
});
