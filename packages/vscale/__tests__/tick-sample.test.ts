import { ticks, d3Ticks } from '../src/utils/tick-sample';

test('ticks() of float number', () => {
  expect(ticks(-0.1, 15, 5)).toEqual([-4, 0, 4, 8, 12, 16]);
  expect(ticks(2, 15, 5)).toEqual([0, 3, 6, 9, 12, 15]);
  expect(ticks(12333.233, 233303, 5)).toEqual([0, 50000, 100000, 150000, 200000, 250000]);
  expect(ticks(12333.233, 12334, 5)).toEqual([12333.2, 12333.4, 12333.6, 12333.8, 12334]);
});

test('ticks() of equal value', () => {
  expect(ticks(0.1, 0.1, 5)).toEqual([0, 0.1, 0.2, 0.3, 0.4]);
  expect(ticks(1e-12, 1e-12, 5)).toEqual([0, 1e-12, 2e-12, 3e-12, 4e-12]);
});

test('ticks() of different tickCount', () => {
  expect(ticks(0, 1, 1)).toEqual([0, 1]);
  expect(ticks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  expect(ticks(0, 245.78, 5)).toEqual([0, 50, 100, 150, 200, 250]);
  expect(ticks(0, 8412, 5)).toEqual([0, 2000, 4000, 6000, 8000, 10000]);
  expect(ticks(0, 2167, 5)).toEqual([0, 500, 1000, 1500, 2000, 2500]);
});

test('d3Ticks() when noDecimals is true', () => {
  expect(d3Ticks(0, 1, 1)).toEqual([0, 1]);
  expect(d3Ticks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  expect(d3Ticks(0, 1, 5, { noDecimals: true })).toEqual([0, 1]);
  expect(d3Ticks(23.4, 23.4, 5, { noDecimals: true })).toEqual([23.4]);
  expect(d3Ticks(23.4, 23.6, 5, { noDecimals: true })).toEqual([]);
  expect(d3Ticks(23.4, 25.7, 5, { noDecimals: true })).toEqual([24, 25]);

  expect(d3Ticks(23, 26, 5)).toEqual([23, 23.5, 24, 24.5, 25, 25.5, 26]);
  expect(d3Ticks(23, 26, 5, { noDecimals: true })).toEqual([23, 24, 25, 26]);

  expect(d3Ticks(23, 26.1, 5)).toEqual([23, 23.5, 24, 24.5, 25, 25.5, 26]);
  expect(d3Ticks(23, 26.1, 5, { noDecimals: true })).toEqual([23, 24, 25, 26]);
});

test('ticks() when noDecimals is true', () => {
  expect(ticks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  expect(ticks(0, 1, 5, { noDecimals: true })).toEqual([0, 1]);
  expect(ticks(23.4, 23.4, 5, { noDecimals: true })).toEqual([21, 22, 23, 24, 25]);
  expect(ticks(23.4, 23.6, 5, { noDecimals: true })).toEqual([23, 24]);
  expect(ticks(23.4, 25.7, 5, { noDecimals: true })).toEqual([23, 24, 25, 26]);

  expect(ticks(23, 26, 5)).toEqual([23, 23.5, 24, 24.5, 25, 25.5, 26]);
  expect(ticks(23, 26, 5, { noDecimals: true })).toEqual([23, 24, 25, 26]);

  expect(ticks(23, 26.1, 5)).toEqual([23, 23.5, 24, 24.5, 25, 25.5, 26, 26.5]);
  expect(ticks(23, 26.1, 5, { noDecimals: true })).toEqual([23, 24, 25, 26, 27]);
});
