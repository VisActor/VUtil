import { SqrtScale } from '../src/sqrt-scale';

it('new SqrtScale() has the expected defaults', () => {
  const s = new SqrtScale();
  expect(s.domain()).toEqual([0, 1]);
  expect(s.range()).toEqual([0, 1]);
  expect(s.clamp()).toBe(false);
  expect(s.interpolate()('red', 'blue')(0.5)).toBe('rgb(128,0,128)');
});

it('new SqrtScale() is an alias for pow().exponent(0.5)', () => {
  const s = new SqrtScale();

  expect(s.scale(0.5)).toBeCloseTo(Math.SQRT1_2, 6);
  expect(s.invert(Math.SQRT1_2)).toBeCloseTo(0.5, 6);
});
