import { calculateTicksOfSingleValue } from '../src/utils/tick-sample';

test('calculateTicksOfSingleValue() of float number', () => {
  expect(calculateTicksOfSingleValue(0.122, 5)).toEqual([0, 0.1, 0.2, 0.3, 0.4]);
  expect(calculateTicksOfSingleValue(-0.122, 5)).toEqual([-0.4, -0.3, -0.2, -0.1, 0]);
  expect(calculateTicksOfSingleValue(0.122, 5, false)).toEqual([0, 1, 2, 3, 4]);
  expect(calculateTicksOfSingleValue(-0.122, 5, false)).toEqual([-4, -3, -2, -1, 0]);

  expect(calculateTicksOfSingleValue(0.00122, 5)).toEqual([0, 0.001, 0.002, 0.003, 0.004]);
  expect(calculateTicksOfSingleValue(-0.00122, 5)).toEqual([-0.004, -0.003, -0.002, -0.001, 0]);
  expect(calculateTicksOfSingleValue(0.00122, 5, false)).toEqual([0, 1, 2, 3, 4]);
  expect(calculateTicksOfSingleValue(-0.00122, 5, false)).toEqual([-4, -3, -2, -1, 0]);

  expect(calculateTicksOfSingleValue(0.99122, 5)).toEqual([0, 1, 2, 3, 4]);
  expect(calculateTicksOfSingleValue(-0.99122, 5)).toEqual([-4, -3, -2, -1, 0]);

  expect(calculateTicksOfSingleValue(0.2122, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8]);
  expect(calculateTicksOfSingleValue(-0.2122, 5)).toEqual([-0.8, -0.6, -0.4, -0.2, 0]);

  expect(calculateTicksOfSingleValue(1.2122, 5)).toEqual([0, 1, 2, 3, 4]);
  expect(calculateTicksOfSingleValue(-1.2122, 5)).toEqual([-4, -3, -2, -1, 0]);

  expect(calculateTicksOfSingleValue(99.2122, 5)).toEqual([97, 98, 99, 100, 101]);
  expect(calculateTicksOfSingleValue(-99.2122, 5)).toEqual([-102, -101, -100, -99, -98]);
});
