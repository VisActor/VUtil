import { ticks } from '../src/utils/tick-sample';

test('ticks() of float number', () => {
  expect(ticks(-0.1, 15, 5)).toEqual([-5, 0, 5, 10, 15]);
  expect(ticks(2, 15, 5)).toEqual([0, 4, 8, 12, 16]);
  expect(ticks(12333.233, 233303, 5)).toEqual([0, 60000, 120000, 180000, 240000]);
  expect(ticks(12333.233, 12334, 5)).toEqual([12333.2, 12333.4, 12333.6, 12333.8, 12334]);
});

test('ticks() of equal value', () => {
  expect(ticks(0.1, 0.1, 5)).toEqual([0, 0.1, 0.2, 0.3, 0.4]);
  expect(ticks(1e-12, 1e-12, 5)).toEqual([0, 1e-12, 2e-12, 3e-12, 4e-12]);
});

test('ticks() of different tickCount', () => {
  expect(ticks(0, 1, 1)).toEqual([0, 1]);
  expect(ticks(0, 245.78, 5)).toEqual([0, 70, 140, 210, 280]);
  expect(ticks(0, 8412, 5)).toEqual([0, 3000, 6000, 9000, 12000]);
  expect(ticks(0, 2167, 5)).toEqual([0, 600, 1200, 1800, 2400]);
});
