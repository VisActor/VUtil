import { IdentityScale } from '../src/identity-scale';

test('IdentityScale of any values', () => {
  const scale = new IdentityScale();

  expect(scale.scale('x')).toBe('x');
  expect(scale.scale(12)).toBe(12);
});

test('IdentityScale, unknow() should return specified unknow when domain is not empty', () => {
  const scale = new IdentityScale();
  const values = ['A', 'B', 'C'];

  scale.domain(['A', 'B', 'C']).unknown('unknow');

  expect(scale.domain()).toEqual(values);
  expect(scale.range()).toEqual(values);
  expect(scale.scale('A')).toBe('A');
  expect(scale.scale('B')).toBe('B');
  expect(scale.scale('C')).toBe('C');
  expect(scale.scale(null)).toBe('unknow');
  expect(scale.scale(undefined)).toBe('unknow');
  expect(scale.scale(1000)).toBe('unknow');
});

test('IdentityScale, unknow() should return specified unknow when domain is empty', () => {
  const scale = new IdentityScale();

  scale.unknown('unknow');

  expect(scale.scale('A')).toBe('A');
  expect(scale.scale('B')).toBe('B');
  expect(scale.scale('C')).toBe('C');
  expect(scale.scale(null)).toBe(null);
  expect(scale.scale(undefined)).toBe(undefined);
  expect(scale.scale(1000)).toBe(1000);
});

test('IdentityScale specified()', () => {
  const scale = new IdentityScale();
  const specified = {
    A: 'A-test',
    B: 'B-test'
  };

  scale.specified(specified);
  expect(scale.scale('A')).toBe(specified.A);
  expect(scale.scale('B')).toBe(specified.B);
  expect(scale.scale('C')).toBe('C');
  expect(scale.scale(null)).toBe(null);
  expect(scale.scale(undefined)).toBe(undefined);
  expect(scale.scale(1000)).toBe(1000);
});
