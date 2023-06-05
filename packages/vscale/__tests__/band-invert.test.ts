import { BandScale } from '../src/band-scale';

test('scaleBand() has the expected defaults', function () {
  const s = new BandScale(true).domain(['A', 'B', 'C', 'D', 'E']);

  expect(s.invert(-1)).toBe('A');
  expect(s.invert(0.1)).toBe('A');
  expect(s.invert(0.2)).toBe('A');
  expect(s.invert(0.3)).toBe('B');
  expect(s.invert(0.4)).toBe('B');
  expect(s.invert(0.5)).toBe('C');
  expect(s.invert(0.6)).toBe('C');
  expect(s.invert(0.7)).toBe('D');
  expect(s.invert(0.8)).toBe('D');
  expect(s.invert(0.9)).toBe('E');
  expect(s.invert(1)).toBe('E');
});
