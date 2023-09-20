import { isValidScaleType, ScaleEnum } from '../src/type';

test('scaleLinear() has the expected defaults', function () {
  expect(isValidScaleType(ScaleEnum.Identity)).toBe(true);

  expect(isValidScaleType(ScaleEnum.Linear)).toBe(true);
  expect(isValidScaleType(ScaleEnum.Log)).toBe(true);
  expect(isValidScaleType(ScaleEnum.Pow)).toBe(true);
  expect(isValidScaleType(ScaleEnum.Sqrt)).toBe(true);
  expect(isValidScaleType(ScaleEnum.Symlog)).toBe(true);
  expect(isValidScaleType(ScaleEnum.Time)).toBe(true);

  expect(isValidScaleType(ScaleEnum.Quantile)).toBe(true);
  expect(isValidScaleType(ScaleEnum.Quantize)).toBe(true);
  expect(isValidScaleType(ScaleEnum.Threshold)).toBe(true);

  expect(isValidScaleType(ScaleEnum.Ordinal)).toBe(true);
  expect(isValidScaleType(ScaleEnum.Point)).toBe(true);
  expect(isValidScaleType(ScaleEnum.Band)).toBe(true);

  expect(isValidScaleType('unknown')).toBe(false);
  expect(isValidScaleType('aaaaa')).toBe(false);
});
