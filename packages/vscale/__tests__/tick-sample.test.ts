import { ticks } from '../src/utils/tick-sample';

test('ticks() of float number', () => {
  expect(ticks(-0.1, 15, 5)).toEqual([-6, 0, 6, 12, 18]);
  expect(ticks(2, 15, 5)).toEqual([0, 4, 8, 12, 16]);
  expect(ticks(12333.233, 233303, 5)).toEqual([0, 100000, 200000, 300000, 400000]);
  expect(ticks(12333.233, 12334, 5)).toEqual([12333.2, 12333.4, 12333.6, 12333.8, 12334]);
});

test('ticks() of equal value', () => {
  expect(ticks(0.1, 0.1, 5)).toEqual([0, 0.1, 0.2, 0.3, 0.4]);
  expect(ticks(1e-12, 1e-12, 5)).toEqual([0, 1e-12, 2e-12, 3e-12, 4e-12]);
});
