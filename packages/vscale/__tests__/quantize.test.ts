import { QuantizeScale } from '../src/quantize-scale';

it('new QuantizeScale() has the expected defaults', () => {
  const s = new QuantizeScale();

  expect(s.domain()).toEqual([0, 1]);
  expect(s.range()).toEqual([0, 1]);
  expect(s.thresholds()).toEqual([0.5]);
  expect(s.scale(0.25)).toBe(0);
  expect(s.scale(0.75)).toEqual(1);
});

it('quantize(value) maps a number to a discrete value in the range', () => {
  const s = new QuantizeScale().range([0, 1, 2]);
  expect(s.thresholds()).toEqual([1 / 3, 2 / 3]);
  expect(s.scale(0.0)).toEqual(0);
  expect(s.scale(0.2)).toEqual(0);
  expect(s.scale(0.4)).toEqual(1);
  expect(s.scale(0.6)).toEqual(1);
  expect(s.scale(0.8)).toEqual(2);
  expect(s.scale(1.0)).toEqual(2);
});

it('quantize(value) clamps input values to the domain', () => {
  const a = {};
  const b = {};
  const c = {};
  const s = new QuantizeScale().range([a, b, c]);
  expect(s.scale(-0.5)).toEqual(a);
  expect(s.scale(+1.5)).toEqual(c);
});

it('quantize.unknown(value) sets the return value for undefined, null, and NaN input', () => {
  const s = new QuantizeScale().range([0, 1, 2]).unknown(-1);
  expect(s.scale(undefined)).toEqual(-1);
  expect(s.scale(null)).toEqual(-1);
  expect(s.scale(NaN)).toEqual(-1);
});

it('quantize.domain() coerces domain values to numbers', () => {
  const s = new QuantizeScale().domain(['-1.20', '2.40']);
  expect(s.domain()).toEqual([-1.2, 2.4]);
  expect(s.scale(-1.2)).toEqual(0);
  expect(s.scale(0.5)).toEqual(0);
  expect(s.scale(0.7)).toEqual(1);
  expect(s.scale(2.4)).toEqual(1);
});

it('quantize.domain() accepts an iterable', () => {
  const s = (new QuantizeScale() as any).domain(new Set([1, 2]));
  expect(s.domain()).toEqual([1, 2]);
});

it('quantize.domain() only considers the first and second element of the domain', () => {
  const s = new QuantizeScale().domain([-1, 100, 200]);
  expect(s.domain()).toEqual([-1, 100]);
});

it('quantize.range() cardinality determines the degree of quantization', () => {
  const s = new QuantizeScale();

  expect(s.range([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]).scale(1 / 3)).toBeCloseTo(0.3, 6);
  expect(s.range([0, 0.2, 0.4, 0.6, 0.8, 1, 1.2]).scale(1 / 3)).toBeCloseTo(0.4, 6);
  expect(s.range([0, 0.25, 0.5, 0.75, 1]).scale(1 / 3)).toBeCloseTo(0.25, 6);
  expect(s.range([0, 0.5, 1, 1.5]).scale(1 / 3)).toBeCloseTo(0.5, 6);
  expect(s.range([0, 1]).scale(1 / 3)).toBeCloseTo(0, 6);
});

it('quantize.range() values are arbitrary', () => {
  const a = {};
  const b = {};
  const c = {};
  const s = new QuantizeScale().range([a, b, c]);
  expect(s.scale(0.0)).toEqual(a);
  expect(s.scale(0.2)).toEqual(a);
  expect(s.scale(0.4)).toEqual(b);
  expect(s.scale(0.6)).toEqual(b);
  expect(s.scale(0.8)).toEqual(c);
  expect(s.scale(1.0)).toEqual(c);
});

it('quantize.invertExtent() maps a value in the range to a domain extent', () => {
  const s = new QuantizeScale().range([0, 1, 2, 3]);
  expect(s.invertExtent(0)).toEqual([0.0, 0.25]);
  expect(s.invertExtent(1)).toEqual([0.25, 0.5]);
  expect(s.invertExtent(2)).toEqual([0.5, 0.75]);
  expect(s.invertExtent(3)).toEqual([0.75, 1.0]);
});

it('quantize.invertExtent() allows arbitrary range values', () => {
  const a = {};
  const b = {};
  const s = new QuantizeScale().range([a, b]);
  expect(s.invertExtent(a)).toEqual([0.0, 0.5]);
  expect(s.invertExtent(b)).toEqual([0.5, 1.0]);
});

it('quantize.invertExtent() returns [NaN, NaN] when the given value is not in the range', () => {
  const s = new QuantizeScale();
  expect(s.invertExtent(-1).every(Number.isNaN)).toBeTruthy();
  expect(s.invertExtent(0.5).every(Number.isNaN)).toBeTruthy();
  expect(s.invertExtent(2).every(Number.isNaN)).toBeTruthy();
  expect(s.invertExtent('a').every(Number.isNaN)).toBeTruthy();
});

it('quantize.invertExtent() returns the first match if duplicate values exist in the range', () => {
  const s = new QuantizeScale().range([0, 1, 2, 0]);
  expect(s.invertExtent(0)).toEqual([0.0, 0.25]);
  expect(s.invertExtent(1)).toEqual([0.25, 0.5]);
});

it('quantize.invertExtent(y) is exactly consistent with quantize(x)', () => {
  const s = new QuantizeScale().domain([4.2, 6.2]).range([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  s.range().forEach(function (y) {
    const e = s.invertExtent(y);
    expect(s.scale(e[0])).toBe(y);
    expect(s.scale(e[1])).toBe(y < 9 ? y + 1 : y);
  });
});
