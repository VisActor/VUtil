import { LinearScale } from '../src/linear-scale';

test('linear.nice() width option forceMin and forceMax', function () {
  const scale = new LinearScale().domain([0, 0.96]);

  scale.nice(10, { forceMin: 8, forceMax: 10 });

  expect(scale.domain()).toEqual([8, 10]);
  expect(scale.ticks(5, { noDecimals: true })).toEqual([8, 9, 10]);
  expect(scale.domain()).toEqual([8, 10]);
  expect(scale.scale(0)).toBeUndefined();
  expect(scale.scale(9)).toBeCloseTo(0.5);
  expect(scale.scale(100)).toBeUndefined();
});

test('linear.nice() width option forceMin', function () {
  const scale = new LinearScale().domain([0, 0.96]);

  scale.nice(10, { forceMin: -10 });

  expect(scale.domain()).toEqual([-10, 1]);
  expect(scale.ticks(5, { noDecimals: true })).toEqual([0, 1]);
  expect(scale.domain()).toEqual([-10, 1]);
  expect(scale.scale(-20)).toBeUndefined();
  expect(scale.scale(-10)).toBe(0);
  expect(scale.scale(9)).toBeCloseTo(1.7272727272727273);
  expect(scale.scale(100)).toBeCloseTo(10);

  scale.nice(10, { forceMin: 0.5 });

  expect(scale.domain()).toEqual([0.5, 1]);
  expect(scale.ticks(5, { noDecimals: true })).toEqual([1]);
  expect(scale.domain()).toEqual([0.5, 1]);
  expect(scale.scale(-20)).toBeUndefined();
  expect(scale.scale(-10)).toBeUndefined();
  expect(scale.scale(9)).toBeCloseTo(17);
  expect(scale.scale(100)).toBeCloseTo(199);
});

test('linear.nice() width option forceMax', function () {
  const scale = new LinearScale().domain([231, 789]);

  scale.nice(10, { forceMax: 700 });

  expect(scale.domain()).toEqual([200, 700]);
  expect(scale.ticks(5)).toEqual([200, 400, 600]);
  expect(scale.domain()).toEqual([200, 700]);
  expect(scale.scale(-20)).toBeCloseTo(-0.44);
  expect(scale.scale(200)).toBe(0);
  expect(scale.scale(789)).toBeUndefined();

  scale.nice(10, { forceMax: 1123 });

  expect(scale.domain()).toEqual([200, 1123]);
  expect(scale.ticks(5)).toEqual([200, 400, 600, 800]);
  expect(scale.domain()).toEqual([200, 1123]);
  expect(scale.scale(-20)).toBeCloseTo(-0.23835319609967498);
  expect(scale.scale(200)).toBeCloseTo(0);
  expect(scale.scale(1200)).toBeUndefined();
});

test('linear.nice() width option min and max', function () {
  const scale = new LinearScale().domain([0, 0.96]);

  // only max is valid
  scale.nice(10, { min: 8, max: 10 });

  expect(scale.domain()).toEqual([0, 10]);
  expect(scale.ticks(5, { noDecimals: true })).toEqual([0, 1]);

  // min and max area valid
  scale.nice(10, { min: -10, max: 10 });

  expect(scale.domain()).toEqual([-10, 10]);
  expect(scale.ticks(5, { noDecimals: true })).toEqual([-10, -5, 0, 5, 10]);

  // only min is valid
  scale.nice(10, { min: -9.5, max: 0 });

  expect(scale.domain()).toEqual([-9.5, 1]);
  expect(scale.ticks(5, { noDecimals: true })).toEqual([0, 1]);

  // both min and max is invalid

  scale.nice(10, { min: 0.1, max: 0.5 });

  expect(scale.domain()).toEqual([0, 1]);
  expect(scale.ticks(5, { noDecimals: true })).toEqual([0, 1]);
});
