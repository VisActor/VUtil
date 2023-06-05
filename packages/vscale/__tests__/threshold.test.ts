import { ThresholdScale } from '../src/threshold-scale';

it('new ThresholdScale() has the expected defaults', () => {
  const x = new ThresholdScale();

  expect(x.domain()).toEqual([0.5]);
  expect(x.range()).toEqual([0, 1]);
  expect(x.scale(0.5)).toEqual(1);
  expect(x.scale(0.49)).toEqual(0);
});

it('threshold(x) maps a number to a discrete value in the range', () => {
  const x = new ThresholdScale().domain([1 / 3, 2 / 3]).range(['a', 'b', 'c']);
  expect(x.scale(0)).toBe('a');
  expect(x.scale(0.2)).toBe('a');
  expect(x.scale(0.4)).toBe('b');
  expect(x.scale(0.6)).toBe('b');
  expect(x.scale(0.8)).toBe('c');
  expect(x.scale(1)).toBe('c');
});

it('threshold(x) returns undefined if the specified value x is not orderable', () => {
  const x = new ThresholdScale().domain([1 / 3, 2 / 3]).range(['a', 'b', 'c']);
  expect((x as any).scale()).toBeUndefined();
  expect(x.scale(undefined)).toBeUndefined();
  expect(x.scale(NaN)).toBeUndefined();
  expect(x.scale(null)).toBeUndefined();
});

it('threshold.domain(…) supports arbitrary orderable values', () => {
  const x = new ThresholdScale().domain(['10', '2']).range([0, 1, 2]);
  expect(x.domain()[0]).toBe('10');
  expect(x.domain()[1]).toBe('2');
  expect(x.scale('0')).toEqual(0);
  expect(x.scale('12')).toEqual(1);
  expect(x.scale('3')).toEqual(2);
});

it('threshold.domain(…) accepts an iterable', () => {
  const x = (new ThresholdScale() as any).domain(new Set(['10', '2'])).range([0, 1, 2]);
  expect(x.domain()).toEqual(['10', '2']);
});

it('threshold.range(…) supports arbitrary values', () => {
  const a = {};
  const b = {};
  const c = {};
  const x = new ThresholdScale().domain([1 / 3, 2 / 3]).range([a, b, c]);
  expect(x.scale(0)).toEqual(a);
  expect(x.scale(0.2)).toEqual(a);
  expect(x.scale(0.4)).toEqual(b);
  expect(x.scale(0.6)).toEqual(b);
  expect(x.scale(0.8)).toEqual(c);
  expect(x.scale(1)).toEqual(c);
});

it('threshold.range(…) accepts an iterable', () => {
  const x = (new ThresholdScale() as any).domain(['10', '2']).range(new Set([0, 1, 2]));
  expect(x.range()).toEqual([0, 1, 2]);
});

it('threshold.invertExtent(y) returns the domain extent for the specified range value', () => {
  const a = {};
  const b = {};
  const c = {};
  const x = new ThresholdScale().domain([1 / 3, 2 / 3]).range([a, b, c]);
  expect(x.invertExtent(a)).toEqual([undefined, 1 / 3]);
  expect(x.invertExtent(b)).toEqual([1 / 3, 2 / 3]);
  expect(x.invertExtent(c)).toEqual([2 / 3, undefined]);
  expect(x.invertExtent({})).toEqual([undefined, undefined]);
});
