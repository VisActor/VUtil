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

  expect(scale.domain()).toEqual([0.5, 8]);
  expect(scale.ticks(5)).toEqual([1, 2, 3, 4, 6, 8]);
  expect(scale.domain()).toEqual([0.5, 8]);
  expect(scale.scale(0.1)).toBeUndefined();
  expect(scale.scale(-10)).toBeUndefined();
  expect(scale.scale(0.7)).toBeCloseTo(0.12135670679256043);
  expect(scale.scale(100)).toBeCloseTo(1.9109640474436813);

  scale.nice(10, { forceMin: 2 });

  expect(scale.domain()).toEqual([2, 8]);
  expect(scale.ticks(5)).toEqual([2, 3, 4, 5, 6, 8]);
  expect(scale.domain()).toEqual([2, 8]);
  expect(scale.scale(-20)).toBeUndefined();
  expect(scale.scale(-10)).toBeUndefined();
  expect(scale.scale(9)).toBeCloseTo(1.0849625007211565);
  expect(scale.scale(100)).toBeCloseTo(2.8219280948873626);
});

test('log.nice() width option forceMax', function () {
  const scale = new LogScale().domain([231, 789]);

  scale.nice(10, { forceMax: 700 });

  expect(scale.domain()).toEqual([231, 700]);
  expect(scale.ticks(5)).toEqual([231, 251, 316, 398, 501, 631, 700]);
  expect(scale.domain()).toEqual([231, 700]);
  expect(scale.scale(10)).toBeCloseTo(-2.832090257288676);
  expect(scale.scale(200)).toBeCloseTo(-0.1299767312314118);
  expect(scale.scale(789)).toBeUndefined();

  scale.nice(10, { forceMax: 1123 });

  expect(scale.domain()).toEqual([231, 1123]);
  expect(scale.ticks(5)).toEqual([231, 251, 316, 398, 501, 631, 794, 1000, 1123]);
  expect(scale.domain()).toEqual([231, 1123]);
  expect(scale.scale(10)).toBeCloseTo(-1.9855503225574376);
  expect(scale.scale(200)).toBeCloseTo(-0.0911253940291301);
  expect(scale.scale(1200)).toBeUndefined();
});

test('log.nice() width option min and max', function () {
  const scale = new LogScale().domain([20, 18990]);

  // only max is valid
  scale.nice(10, { min: 28, max: 23456 });

  expect(scale.domain()).toEqual([20, 23456]);

  // min and max area valid
  scale.nice(10, { min: 13, max: 34677 });

  expect(scale.domain()).toEqual([13, 34677]);

  // only min is valid
  scale.nice(10, { min: 13, max: 2233 });

  expect(scale.domain()).toEqual([13, 18990]);

  // both min and max is invalid

  scale.nice(10, { min: 23, max: 1000 });

  expect(scale.domain()).toEqual([20, 18990]);
});
