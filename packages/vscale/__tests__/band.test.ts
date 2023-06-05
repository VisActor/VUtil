import { BandScale } from '../src/band-scale';

test('scaleBand() has the expected defaults', function () {
  const s = new BandScale();
  expect(s.domain()).toEqual([]);
  expect(s.range()).toEqual([0, 1]);
  expect(s.bandwidth()).toBe(1);
  expect(s.step()).toBe(1);
  expect(s.round()).toBe(false);
  expect(s.paddingInner()).toBe(0);
  expect(s.paddingOuter()).toBe(0);
  expect(s.align()).toBe(0.5);
});

test('band(value) computes discrete bands in a continuous range', function () {
  const s = new BandScale().range([0, 960]);
  expect(s.scale('foo')).toBe(undefined);
  s.domain(['foo', 'bar']);
  expect(s.scale('foo')).toBe(0);
  expect(s.scale('bar')).toBe(480);
  s.domain(['a', 'b', 'c']).range([0, 120]);
  expect(s.domain().map(s.scale.bind(s))).toEqual([0, 40, 80]);
  expect(s.bandwidth()).toBe(40);
  s.padding(0.2);
  expect(s.domain().map(s.scale.bind(s))).toEqual([7.5, 45, 82.5]);
  expect(s.bandwidth()).toBe(30);
});

test('band(value) returns undefined for values outside the domain', function () {
  const s = new BandScale().domain(['a', 'b', 'c']).range([0, 1]);
  expect(s.scale('d')).toBe(undefined);
  expect(s.scale('e')).toBe(undefined);
  expect(s.scale('f')).toBe(undefined);
});

test('band(value) does not implicitly add values to the domain', function () {
  const s = new BandScale().domain(['a', 'b', 'c']).range([0, 1]);
  s.scale('d');
  s.scale('e');
  expect(s.domain()).toEqual(['a', 'b', 'c']);
});

test('band.step() returns the distance between the starts of adjacent bands', function () {
  const s = new BandScale().range([0, 960]);
  expect(s.domain(['foo']).step()).toBe(960);
  expect(s.domain(['foo', 'bar']).step()).toBe(480);
  expect(s.domain(['foo', 'bar', 'baz']).step()).toBe(320);
  s.padding(0.5);
  // TODO different with D3 when domain.length === 1
  // expect(s.domain(['foo']).step(), 640);
  expect(s.domain(['foo']).step()).toBe(480);
  expect(s.domain(['foo', 'bar']).step()).toBe(384);
});

test('band.bandwidth() returns the width of the band', function () {
  const s = new BandScale().range([0, 960]);
  expect(s.domain([]).bandwidth()).toBe(960);
  expect(s.domain(['foo']).bandwidth()).toBe(960);
  expect(s.domain(['foo', 'bar']).bandwidth()).toBe(480);
  expect(s.domain(['foo', 'bar', 'baz']).bandwidth()).toBe(320);
  s.padding(0.5);
  expect(s.domain([]).bandwidth()).toBe(480);
  // TODO different with D3 when domain.length === 1
  // expect(s.domain(['foo']).bandwidth(), 320);
  expect(s.domain(['foo']).bandwidth()).toBe(240);
  expect(s.domain(['foo', 'bar']).bandwidth()).toBe(192);
});

test('band.domain([]) computes reasonable band and step values', function () {
  const s = new BandScale().range([0, 960]).domain([]);
  expect(s.step()).toBe(960);
  expect(s.bandwidth()).toBe(960);
  s.padding(0.5);
  expect(s.step()).toBe(960);
  expect(s.bandwidth()).toBe(480);
  s.padding(1);
  expect(s.step()).toBe(960);
  expect(s.bandwidth()).toBe(0);
});

test('band.domain([value]) computes a reasonable singleton band, even with padding', function () {
  // TODO different with D3 when domain.length === 1
  const s = new BandScale().range([0, 960]).domain(['foo']);
  expect(s.scale('foo')).toBe(0);
  expect(s.step()).toBe(960);
  expect(s.bandwidth()).toBe(960);
  s.padding(0.5);
  // expect(s.scale('foo'), 320);
  // expect(s.step(), 640);
  // expect(s.bandwidth(), 320);
  expect(s.scale('foo')).toBe(360);
  expect(s.step()).toBe(480);
  expect(s.bandwidth()).toBe(240);
  s.padding(1);
  expect(s.scale('foo')).toBe(480);
  // expect(s.step()).toBe(480);
  expect(s.step()).toBe(320);
  expect(s.bandwidth()).toBe(0);
});

test('band.domain(values) recomputes the bands', function () {
  const s = new BandScale().domain(['a', 'b', 'c']).rangeRound([0, 100]);
  expect(s.domain().map(s.scale.bind(s))).toEqual([1, 34, 67]);
  expect(s.bandwidth()).toBe(33);
  s.domain(['a', 'b', 'c', 'd']);
  expect(s.domain().map(s.scale.bind(s))).toEqual([0, 25, 50, 75]);
  expect(s.bandwidth()).toBe(25);
});

test('band.domain(domain) accepts an iterable', function () {
  expect((new BandScale() as any).domain(new Set(['a', 'b', 'c'])).domain()).toEqual(['a', 'b', 'c']);
});

test('band.domain(values) makes a copy of the specified domain values', function () {
  const domain = ['red', 'green'];
  const s = new BandScale().domain(domain);
  domain.push('blue');
  expect(s.domain()).toEqual(['red', 'green']);
});

test('band.domain() returns a copy of the domain', function () {
  const s = new BandScale().domain(['red', 'green']);
  const domain = s.domain();
  expect(domain).toEqual(['red', 'green']);
  domain.push('blue');
  expect(s.domain()).toEqual(['red', 'green']);
});

test('band.range(values) can be descending', function () {
  const s = new BandScale().domain(['a', 'b', 'c']).range([120, 0]);
  expect(s.domain().map(s.scale.bind(s))).toEqual([80, 40, 0]);
  expect(s.bandwidth()).toBe(40);
  s.padding(0.2);
  expect(s.domain().map(s.scale.bind(s))).toEqual([82.5, 45, 7.5]);
  expect(s.bandwidth()).toBe(30);
});

test('band.range(values) makes a copy of the specified range values', function () {
  const range = [1, 2];
  const s = new BandScale().range(range);
  (range as any).push('blue');
  expect(s.range()).toEqual([1, 2]);
});

test('band.range() returns a copy of the range', function () {
  const s = new BandScale().range([1, 2]);
  const range = s.range();
  expect(range).toEqual([1, 2]);
  range.push('blue');
  expect(s.range()).toEqual([1, 2]);
});

test('band.range(values) accepts an iterable', function () {
  const s = new BandScale().range([1, 2]);
  expect(s.range()).toEqual([1, 2]);
});

test('band.rangeRound(values) accepts an iterable', function () {
  const s = new BandScale().rangeRound([1, 2]);
  expect(s.range()).toEqual([1, 2]);
});

test('band.range(values) coerces values to numbers', function () {
  const s = new BandScale().range(['1.0', '2.0']);
  expect(s.range()).toEqual([1, 2]);
});

test('band.rangeRound(values) coerces values to numbers', function () {
  const s = new BandScale().rangeRound(['1.0', '2.0']);
  expect(s.range()).toEqual([1, 2]);
});

test('band.paddingInner(p) specifies the inner padding p', function () {
  const s = new BandScale().domain(['a', 'b', 'c']).range([120, 0]).paddingInner(0.1).round(true);
  expect(s.domain().map(s.scale.bind(s))).toEqual([83, 42, 1]);
  expect(s.bandwidth()).toBe(37);
  s.paddingInner(0.2);
  expect(s.domain().map(s.scale.bind(s))).toEqual([85, 43, 1]);
  expect(s.bandwidth()).toBe(34);
});

test('band.paddingInner(p) coerces p to a number <= 1', function () {
  const s = new BandScale();
  expect((s as any).paddingInner('1.0').paddingInner()).toBe(1);
  expect((s as any).paddingInner('-1.0').paddingInner()).toBe(0);
  expect((s as any).paddingInner('2.0').paddingInner()).toBe(1);
  expect(Number.isNaN(s.paddingInner(NaN).paddingInner())).toBeTruthy();
});

test('band.paddingOuter(p) specifies the outer padding p', function () {
  const s = new BandScale().domain(['a', 'b', 'c']).range([120, 0]).paddingInner(0.2).paddingOuter(0.1);
  expect(s.domain().map(s.scale.bind(s))).toEqual([84, 44, 4]);
  expect(s.bandwidth()).toBe(32);
  s.paddingOuter(1);
  expect(s.domain().map(s.scale.bind(s))).toEqual([75, 50, 25]);
  expect(s.bandwidth()).toBe(20);
});

test('band.paddingOuter(p) coerces p to a number', function () {
  const s = new BandScale();
  expect((s as any).paddingOuter('1.0').paddingOuter()).toBe(1);
  expect((s as any).paddingOuter('-1.0').paddingOuter()).toBe(0);
  expect((s as any).paddingOuter('2.0').paddingOuter()).toBe(1);
  expect(Number.isNaN(s.paddingOuter(NaN).paddingOuter())).toBeTruthy();
});

test('band.rangeRound(values) is an alias for band.range(values).round(true)', function () {
  const s = new BandScale().domain(['a', 'b', 'c']).rangeRound([0, 100]);
  expect(s.range()).toEqual([0, 100]);
  expect(s.round()).toBe(true);
});

test('band.round(true) computes discrete rounded bands in a continuous range', function () {
  const s = new BandScale().domain(['a', 'b', 'c']).range([0, 100]).round(true);
  expect(s.domain().map(s.scale.bind(s))).toEqual([1, 34, 67]);
  expect(s.bandwidth()).toBe(33);
  s.padding(0.2);
  expect(s.domain().map(s.scale.bind(s))).toEqual([7, 38, 69]);
  expect(s.bandwidth()).toBe(25);
});

test('band.clone() copies all fields', function () {
  const s1 = new BandScale().domain(['red', 'green']).range([1, 2]).round(true).paddingInner(0.1).paddingOuter(0.2);
  const s2 = s1.clone();
  expect(s2.domain()).toEqual(s1.domain());
  expect(s2.range()).toEqual(s1.range());
  expect(s2.round()).toBe(s1.round());
  expect(s2.paddingInner()).toBe(s1.paddingInner());
  expect(s2.paddingOuter()).toBe(s1.paddingOuter());
});

test('band.clone() isolates changes to the domain', function () {
  const s1 = new BandScale().domain(['foo', 'bar']).range([0, 2]);
  const s2 = s1.clone();
  s1.domain(['red', 'blue']);
  expect(s2.domain()).toEqual(['foo', 'bar']);
  expect(s1.domain().map(s1.scale.bind(s1))).toEqual([0, 1]);
  // TODO
  expect(s2.domain().map(s2.scale.bind(s2))).toEqual([0, 1]);
  s2.domain(['red', 'blue']);
  expect(s1.domain()).toEqual(['red', 'blue']);
  expect(s1.domain().map(s1.scale.bind(s1))).toEqual([0, 1]);
  // TODO
  expect(s2.domain().map(s2.scale.bind(s2))).toEqual([0, 1]);
});

test('band.clone() isolates changes to the range', function () {
  const s1 = new BandScale().domain(['foo', 'bar']).range([0, 2]);
  const s2 = s1.clone();
  s1.range([3, 5]);
  // TODO
  expect(s2.range()).toEqual([0, 2]);
  expect(s1.domain().map(s1.scale.bind(s1))).toEqual([3, 4]);
  // TODO
  expect(s2.domain().map(s2.scale.bind(s2))).toEqual([0, 1]);
  s2.range([5, 7]);
  expect(s1.range()).toEqual([3, 5]);
  expect(s1.domain().map(s1.scale.bind(s1))).toEqual([3, 4]);
  expect(s2.domain().map(s2.scale.bind(s2))).toEqual([5, 6]);
});

test('band.invert() when range is positive', function () {
  const s1 = new BandScale().domain(['foo', 'bar', 'car']).range([0, 2]);

  expect(s1.invert(-1)).toBe('foo');
  expect(s1.invert(0)).toBe('foo');
  expect(s1.invert(1)).toBe('bar');
  expect(s1.invert(2)).toBe('car');
  expect(s1.invert(3)).toBe('car');
});

test('band.invert() when range is negative', function () {
  const s1 = new BandScale().domain(['foo', 'bar', 'car']).range([2, 0]);

  expect(s1.invert(-1)).toBe('car');
  expect(s1.invert(0)).toBe('car');
  expect(s1.invert(1)).toBe('bar');
  expect(s1.invert(2)).toBe('foo');
  expect(s1.invert(3)).toBe('foo');
});

test('band.invert() when range is positive and paddingInner is 0.1', function () {
  const s1 = new BandScale().domain(['foo', 'bar', 'car']).paddingInner(0.1).paddingOuter(0.3).range([0, 2]);

  expect(s1.invert(-1)).toBe('foo');
  expect(s1.invert(0)).toBe('foo');
  expect(s1.invert(0.1)).toBe('foo');
  expect(s1.invert(1)).toBe('bar');
  expect(s1.invert(2)).toBe('car');
  expect(s1.invert(1.9)).toBe('car');
  expect(s1.invert(3)).toBe('car');
});

test('band.invert() when range is negative and paddingInner is 0.1', function () {
  const s1 = new BandScale().domain(['foo', 'bar', 'car']).paddingInner(0.1).paddingOuter(0.1).range([2, 0]);

  expect(s1.invert(-1)).toBe('car');
  expect(s1.invert(0)).toBe('car');
  expect(s1.invert(0.1)).toBe('car');
  expect(s1.invert(1)).toBe('bar');
  expect(s1.invert(2)).toBe('foo');
  expect(s1.invert(1.9)).toBe('foo');
  expect(s1.invert(3)).toBe('foo');
});

// TODO align tests for padding & round

test('band.ticks(count) when rangeFactor is not empty', function () {
  const s = new BandScale().domain(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], true).range([0, 100]);
  const tickData0 = s.ticks(-1);

  expect(tickData0).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
  s.rangeFactor([0, 0.3]);

  const tickData1 = s.ticks(-1);

  expect(tickData1).toEqual(['A', 'B', 'C']);
});
