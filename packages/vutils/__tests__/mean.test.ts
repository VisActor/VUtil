import { mean } from '../src';
test('mean handles empty, finite extremes and preserves input', () => {
  expect(mean([])).toBeUndefined();
  expect(mean(Object.freeze([1, 3]))).toBe(2);
  expect(mean([1e308, 1e308])).toBe(1e308);
  expect(mean([-1e308, 1e308])).toBe(0);
  expect(() => mean([Infinity])).toThrow(RangeError);
});

test('mean preserves small contributions when large values cancel', () => {
  expect(mean([1e308, 1, -1e308])).toBeCloseTo(1 / 3, 12);
  expect(mean([-1e308, 1, 1e308])).toBeCloseTo(1 / 3, 12);
  expect(mean([1e308, -1e308, 1])).toBeCloseTo(1 / 3, 12);
  expect(mean([0, 0, 0])).toBe(0);
});

test.each([NaN, Infinity, -Infinity])('mean rejects non-finite observations: %s', value => {
  expect(() => mean([1, value])).toThrow(RangeError);
});
