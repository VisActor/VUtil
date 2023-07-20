import { OrdinalScale } from '../src/ordinal-scale';

test('scaleOrdinal() has the expected defaults', function () {
  const s = new OrdinalScale();
  expect(s.domain()).toEqual([]);
  expect(s.range()).toEqual([]);
  expect(s.scale(0)).toBe(undefined);
  expect(s.domain()).toEqual([0]);
});

test('ordinal(x) maps a unique name x in the domain to the corresponding value y in the range', function () {
  const s = new OrdinalScale().domain([0, 1]).range(['foo', 'bar']);
  expect(s.scale(0)).toBe('foo');
  expect(s.scale(1)).toBe('bar');
  s.range(['a', 'b', 'c']);
  expect(s.scale(0)).toBe('a');
  expect(s.scale('0')).toBe('a');
  expect(s.scale([0])).toBe('a');
  expect(s.scale(1)).toBe('b');
  expect(s.scale(2.0)).toBe('c');
  expect(s.scale(Number(2))).toBe('c');
});

test('ordinal(x) when range are objects array', function () {
  const colorA = { gradient: 'liner' };
  const colorB = { gradient: 'radial' };
  const s = new OrdinalScale().range([colorA, colorB]);
  expect(s.domain()).toEqual([]);
  expect(s.scale(0)).toBe(colorA);
  expect(s.domain()).toEqual([0]);
  expect(s.scale(1)).toBe(colorB);
  expect(s.domain()).toEqual([0, 1]);
});

test('ordinal(x) implicitly extends the domain when a range is explicitly specified', function () {
  const s = new OrdinalScale().range(['foo', 'bar']);
  expect(s.domain()).toEqual([]);
  expect(s.scale(0)).toBe('foo');
  expect(s.domain()).toEqual([0]);
  expect(s.scale(1)).toBe('bar');
  expect(s.domain()).toEqual([0, 1]);
});

test('ordinal.domain(x) makes a copy of the domain', function () {
  const domain = ['red', 'green'];
  const s = new OrdinalScale().domain(domain);
  domain.push('blue');
  expect(s.domain()).toEqual(['red', 'green']);
});

test('ordinal.domain() returns a copy of the domain', function () {
  const s = new OrdinalScale().domain(['red', 'green']);
  const domain = s.domain();
  s.scale('blue');
  expect(domain).toEqual(['red', 'green']);
});

test('ordinal.domain() accepts an iterable', function () {
  const s = (new OrdinalScale() as any).domain(new Set(['red', 'green']));
  expect(s.domain()).toEqual(['red', 'green']);
});

test('ordinal.domain() replaces previous domain values', function () {
  const s = new OrdinalScale().range(['foo', 'bar']);
  expect(s.scale(1)).toBe('foo');
  expect(s.scale(0)).toBe('bar');
  expect(s.domain()).toEqual([1, 0]);
  s.domain(['0', '1']);
  expect(s.scale(0)).toBe('foo'); // it changed!
  expect(s.scale(1)).toBe('bar');
  expect(s.domain()).toEqual(['0', '1']);
});

test('ordinal.domain() uniqueness is based on string coercion', function () {
  const s = new OrdinalScale().domain(['foo']).range([42, 43, 44]);
  expect(s.scale(String('foo'))).toBe(42);
  expect(
    s.scale({
      toString() {
        return 'foo';
      }
    })
  ).toBe(42);
  expect(
    s.scale({
      toString() {
        return 'bar';
      }
    })
  ).toBe(43);
});

test('ordinal.domain() does not coerce domain values to strings', function () {
  const s = new OrdinalScale().domain([0, 1]);
  expect(s.domain()).toEqual([0, 1]);
  expect(typeof s.domain()[0]).toBe('number');
  expect(typeof s.domain()[1]).toBe('number');
});

test('ordinal.domain() does not barf on object built-ins', function () {
  const s = new OrdinalScale().domain(['__proto__', 'hasOwnProperty']).range([42, 43]);
  expect(s.scale('__proto__')).toBe(42);
  expect(s.scale('hasOwnProperty')).toBe(43);
  expect(s.domain()).toEqual(['__proto__', 'hasOwnProperty']);
});

test('ordinal.domain() is ordered by appearance', function () {
  const s = new OrdinalScale();
  s.scale('foo');
  s.scale('bar');
  s.scale('baz');
  expect(s.domain()).toEqual(['foo', 'bar', 'baz']);
  s.domain(['baz', 'bar']);
  s.scale('foo');
  expect(s.domain()).toEqual(['baz', 'bar', 'foo']);
  s.domain(['baz', 'foo']);
  expect(s.domain()).toEqual(['baz', 'foo']);
  s.domain([]);
  s.scale('foo');
  s.scale('bar');
  expect(s.domain()).toEqual(['foo', 'bar']);
});

test('ordinal.range(x) makes a copy of the range', function () {
  const range = ['red', 'green'];
  const s = new OrdinalScale().range(range);
  range.push('blue');
  expect(s.range()).toEqual(['red', 'green']);
});

test('ordinal.range() accepts an iterable', function () {
  const s = (new OrdinalScale() as any).range(new Set(['red', 'green']));
  expect(s.range()).toEqual(['red', 'green']);
});

test('ordinal.range() returns a copy of the range', function () {
  const s = new OrdinalScale().range(['red', 'green']);
  const range = s.range();
  expect(range).toEqual(['red', 'green']);
  range.push('blue');
  expect(s.range()).toEqual(['red', 'green']);
});

test('ordinal.range(values) does not discard implicit domain associations', function () {
  const s = new OrdinalScale();
  expect(s.scale(0)).toBe(undefined);
  expect(s.scale(1)).toBe(undefined);
  s.range(['foo', 'bar']);
  expect(s.scale(1)).toBe('bar');
  expect(s.scale(0)).toBe('foo');
});

test('ordinal(value) recycles values when exhausted', function () {
  const s = new OrdinalScale().range(['a', 'b', 'c']);
  expect(s.scale(0)).toBe('a');
  expect(s.scale(1)).toBe('b');
  expect(s.scale(2)).toBe('c');
  expect(s.scale(3)).toBe('a');
  expect(s.scale(4)).toBe('b');
  expect(s.scale(5)).toBe('c');
  expect(s.scale(2)).toBe('c');
  expect(s.scale(1)).toBe('b');
  expect(s.scale(0)).toBe('a');
});

test('ordinal.unknown(x) sets the output value for unknown inputs', function () {
  const s = new OrdinalScale().domain(['foo', 'bar']).unknown('gray').range(['red', 'blue']);
  expect(s.scale('foo')).toBe('red');
  expect(s.scale('bar')).toBe('blue');
  expect(s.scale('baz')).toBe('gray');
  expect(s.scale('quux')).toBe('gray');
});

test('ordinal.unknown(x) prevents implicit domain extension if x is not implicit', function () {
  const s = new OrdinalScale().domain(['foo', 'bar']).unknown(undefined).range(['red', 'blue']);
  expect(s.scale('baz')).toBe(undefined);
  expect(s.domain()).toEqual(['foo', 'bar']);
});

test('ordinal.clone() copies all fields', function () {
  const s1 = new OrdinalScale().domain([1, 2]).range(['red', 'green']).unknown('gray');
  const s2 = s1.clone();
  expect(s2.domain()).toEqual(s1.domain());
  expect(s2.range()).toEqual(s1.range());
  expect(s2.unknown()).toEqual(s1.unknown());
});

test('ordinal.clone() changes to the domain are isolated', function () {
  const s1 = new OrdinalScale().range(['foo', 'bar']);
  const s2 = s1.clone();
  s1.domain([1, 2]);
  expect(s2.domain()).toEqual([]);
  expect(s1.scale(1)).toBe('foo');
  expect(s2.scale(1)).toBe('foo');
  s2.domain([2, 3]);
  expect(s1.scale(2)).toBe('bar');
  expect(s2.scale(2)).toBe('foo');
  expect(s1.domain()).toEqual([1, 2]);
  expect(s2.domain()).toEqual([2, 3]);
});

test('ordinal.clone() changes to the range are isolated', function () {
  const s1 = new OrdinalScale().range(['foo', 'bar']);
  const s2 = s1.clone();
  s1.range(['bar', 'foo']);
  expect(s1.scale(1)).toBe('bar');
  expect(s2.scale(1)).toBe('foo');
  expect(s2.range()).toEqual(['foo', 'bar']);
  s2.range(['foo', 'baz']);
  expect(s1.scale(2)).toBe('foo');
  expect(s2.scale(2)).toBe('baz');
  expect(s1.range()).toEqual(['bar', 'foo']);
  expect(s2.range()).toEqual(['foo', 'baz']);
});

test('ordinal.specified could set & get the special map and work well', function () {
  const s = new OrdinalScale().domain(['a', 'b']).range(['white', 'black']).specified({ a: 'red' });
  expect(s.specified()).toEqual({ a: 'red' });
  expect(s.scale('a')).toEqual('red');
  expect(s.scale('b')).toEqual('black');

  s.specified({ a: undefined, b: null });

  expect(s.scale('a')).toEqual('white');
  expect(s.scale('b')).toEqual(null);
});
