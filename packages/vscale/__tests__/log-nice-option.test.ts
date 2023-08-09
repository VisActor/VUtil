import { LogScale } from '../src/log-scale';

test('log.nice() width option forceMin and forceMax', function () {
  const scale = new LogScale().domain([1, 8]);
  scale.nice(10, { forceMin: 8, forceMax: 10 });

  expect(scale.domain()).toEqual([8, 10]);
  expect(scale.ticks(5)).toEqual([8, 9, 10]);
  expect(scale.domain()).toEqual([8, 10]);
  expect(scale.scale(0)).toBeUndefined();
  expect(scale.scale(9)).toBeCloseTo(0.527835265517185);
  expect(scale.scale(100)).toBeUndefined();
});

test('log.nice() width option forceMin', function () {
  const scale = new LogScale().domain([1, 8]);

  scale.nice(10, { forceMin: 0.5 });

  expect(scale.domain()).toEqual([0.5, 10]);
  expect(scale.ticks(5)).toEqual([0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  expect(scale.domain()).toEqual([0.5, 10]);
  expect(scale.scale(0.1)).toBeUndefined();
  expect(scale.scale(-10)).toBeUndefined();
  expect(scale.scale(0.7)).toBeCloseTo(0.11231719189046176);
  expect(scale.scale(100)).toBeCloseTo(1.7686217868402407);

  scale.nice(10, { forceMin: 2 });

  expect(scale.domain()).toEqual([2, 10]);
  expect(scale.ticks(5)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
  expect(scale.domain()).toEqual([2, 10]);
  expect(scale.scale(-20)).toBeUndefined();
  expect(scale.scale(-10)).toBeUndefined();
  expect(scale.scale(9)).toBeCloseTo(0.9345358308985777);
  expect(scale.scale(100)).toBeCloseTo(2.4306765580733933);
});

test('log.nice() width option forceMax', function () {
  const scale = new LogScale().domain([231, 789]);

  scale.nice(10, { forceMax: 700 });

  expect(scale.domain()).toEqual([100, 700]);
  expect(scale.ticks(5)).toEqual([100, 200, 300, 400, 500, 600, 700]);
  expect(scale.domain()).toEqual([100, 700]);
  expect(scale.scale(10)).toBeCloseTo(-1.1832946624549383);
  expect(scale.scale(200)).toBeCloseTo(0.3562071871080222);
  expect(scale.scale(789)).toBeUndefined();

  scale.nice(10, { forceMax: 1123 });

  expect(scale.domain()).toEqual([100, 1123]);
  expect(scale.ticks(5)).toEqual([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]);
  expect(scale.domain()).toEqual([100, 1123]);
  expect(scale.scale(10)).toBeCloseTo(-0.952036626790323);
  expect(scale.scale(200)).toBeCloseTo(0.28659158163464227);
  expect(scale.scale(1200)).toBeUndefined();
});

test('log.nice() width option min and max', function () {
  const scale = new LogScale().domain([20, 18990]);

  // only max is valid
  scale.nice(10, { min: 28, max: 23456 });

  expect(scale.domain()).toEqual([10, 23456]);

  // min and max area valid
  scale.nice(10, { min: 13, max: 34677 });

  expect(scale.domain()).toEqual([13, 34677]);

  // only min is valid
  scale.nice(10, { min: 13, max: 2233 });

  expect(scale.domain()).toEqual([13, 100000]);

  // both min and max is invalid

  scale.nice(10, { min: 23, max: 1000 });

  expect(scale.domain()).toEqual([10, 100000]);
});
