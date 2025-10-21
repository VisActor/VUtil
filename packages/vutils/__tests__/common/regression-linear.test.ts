import { regressionLinear } from '../../src';

test('regressionLinear()', function () {
  const arr = [
    {
      x: 1,
      y: 2
    },
    {
      x: 2,
      y: 4
    }
  ];
  const res = regressionLinear(arr);
  expect(res.coef).toEqual({ a: 0, b: 2 });
  expect(res.predict(1)).toBeCloseTo(2);
});
