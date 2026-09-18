import { regressionLowess } from '../src/common/regression-lowess';

type Point = { x: number; y: number };

// A direct distance-ranked reference, independent of the production window search.
function referencePredict(data: Point[], x0: number, span: number, degree: 0 | 1) {
  if (!data.length) {
    return 0;
  }
  const count = Math.min(data.length, Math.max(2, Math.floor(span * data.length)));
  const nearest = data
    .map((p, index) => ({ ...p, index, distance: Math.abs(p.x - x0) }))
    .sort((a, b) => a.distance - b.distance || a.index - b.index)
    .slice(0, count);
  const radius = nearest[nearest.length - 1].distance;
  let sw = 0;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  nearest.forEach(p => {
    const u = radius === 0 ? 0 : p.distance / radius;
    const w = u >= 1 ? 0 : Math.pow(1 - u * u * u, 3);
    sw += w;
    sx += w * p.x;
    sy += w * p.y;
    sxx += w * p.x * p.x;
    sxy += w * p.x * p.y;
  });
  if (sw === 0) {
    return nearest[0].y;
  }
  if (degree === 0) {
    return sy / sw;
  }
  const meanX = sx / sw;
  const meanY = sy / sw;
  const denominator = sxx - sx * meanX;
  const slope = Math.abs(denominator) < 1e-12 ? 0 : (sxy - sx * meanY) / denominator;
  return meanY + slope * (x0 - meanX);
}

const cases: { name: string; data: Point[] }[] = [
  {
    name: 'a dense cluster separated from an outlier',
    data: [0, 10, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8].map(x => ({ x, y: x * x }))
  },
  {
    name: 'clusters with different densities',
    data: [0, 0.1, 0.2, 0.3, 3, 10, 20, 20.1, 20.2, 50].map(x => ({ x, y: Math.sin(x) }))
  },
  {
    name: 'unsorted repeated x values',
    data: [2, 1, 10, 1, 1, 7, 1, 10, 50].map((x, i) => ({ x, y: Math.sin(x) + i }))
  },
  {
    name: 'two points in reverse x order',
    data: [
      { x: 2, y: 20 },
      { x: 0, y: 5 }
    ]
  },
  { name: 'coincident points', data: [1, 2, 3, 4, 5, 6, 7].map(y => ({ x: 1, y })) },
  { name: 'one point', data: [{ x: 4, y: 9 }] },
  { name: 'no points', data: [] }
];

describe.each([0, 1] as const)('LOWESS nearest neighbors with degree=%i', degree => {
  test.each(cases)('matches distance-ranked neighbors for $name', ({ data }) => {
    for (const span of [0.3, 0.6, 1]) {
      const model = regressionLowess(data, undefined, undefined, { span, degree, iterations: 0 });
      const bounds = data.length ? [Math.min(...data.map(p => p.x)) - 1, Math.max(...data.map(p => p.x)) + 1] : [];
      for (const x0 of [...bounds, 0, 0.15, 1, 2.5, 10.05, 12, 20]) {
        expect(Math.abs((model.predict(x0) as number) - referencePredict(data, x0, span, degree))).toBeLessThan(1e-8);
      }
      const grid = model.evaluateGrid(11);
      expect(grid).toHaveLength(data.length ? 11 : 0);
      for (const p of grid) {
        expect(Math.abs(p.y - referencePredict(data, p.x, span, degree))).toBeLessThan(1e-8);
      }
    }
  });
});

test.each([
  [
    { x: 2, y: 20 },
    { x: 0, y: 5 }
  ],
  [
    { x: 0, y: 5 },
    { x: 2, y: 20 }
  ]
])('uses original input order when equally near points have zero weight: %j, %j', (first, second) => {
  expect(regressionLowess([first, second]).predict(1)).toBe(first.y);
});

test('keeps the first coincident points when the neighborhood radius is zero', () => {
  const data = [1, 2, 3, 4, 5, 6, 7].map(y => ({ x: 1, y }));
  expect(regressionLowess(data).predict(1)).toBe(1.5);
});
