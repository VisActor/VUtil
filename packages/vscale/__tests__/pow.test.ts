import { PowScale } from '../src/pow-scale';

function roundEpsilon(x: number) {
  return Math.round(x * 1e12) / 1e12;
}

it('new PowScale() has the expected defaults', () => {
  const s = new PowScale();
  expect(s.domain()).toEqual([0, 1]);
  expect(s.range()).toEqual([0, 1]);
  expect(s.clamp()).toBeFalsy();
  expect(s.exponent()).toBe(1);
  expect(s.interpolate()('red', 'blue')(0.5)).toBe('rgb(128,0,128)');
});

it('pow(x) maps a domain value x to a range value y', () => {
  expect(new PowScale().exponent(0.5).scale(0.5)).toBe(Math.SQRT1_2);
});

it('pow(x) ignores extra range values if the domain is smaller than the range', () => {
  expect(
    new PowScale().domain([-10, 0]).forceAlignDomainRange(false).range(['red', 'white', 'green']).clamp(true).scale(-5)
  ).toBe('rgb(255,128,128)');
  expect(
    new PowScale().domain([-10, 0]).forceAlignDomainRange(false).range(['red', 'white', 'green']).clamp(true).scale(50)
  ).toBe('rgb(255,255,255)');
});

it('pow(x) ignores extra domain values if the range is smaller than the domain', () => {
  expect(new PowScale().domain([-10, 0, 100]).range(['red', 'white']).clamp(true).scale(-5)).toBe('rgb(255,128,128)');
  expect(new PowScale().domain([-10, 0, 100]).range(['red', 'white']).clamp(true).scale(50)).toBe('rgb(255,255,255)');
});

it('pow(x) maps an empty domain to the middle of the range', () => {
  expect(new PowScale().domain([0, 0]).range([1, 2]).scale(0)).toBe(1.5);
  expect(new PowScale().domain([0, 0]).range([2, 1]).scale(1)).toBe(1.5);
});

it('pow(x) can map a bipow domain with two values to the corresponding range', () => {
  const s = new PowScale().domain([1, 2]);
  expect(s.domain()).toEqual([1, 2]);
  expect(s.scale(0.5)).toBe(-0.5);
  expect(s.scale(1.0)).toBe(0.0);
  expect(s.scale(1.5)).toBe(0.5);
  expect(s.scale(2.0)).toBe(1.0);
  expect(s.scale(2.5)).toBe(1.5);
  expect(s.invert(-0.5)).toBe(0.5);
  expect(s.invert(0.0)).toBe(1.0);
  expect(s.invert(0.5)).toBe(1.5);
  expect(s.invert(1.0)).toBe(2.0);
  expect(s.invert(1.5)).toBe(2.5);
});

it('pow(x) can map a polypow domain with more than two values to the corresponding range', () => {
  const s = new PowScale().domain([-10, 0, 100]).range(['red', 'white', 'green']);
  expect(s.domain()).toEqual([-10, 0, 100]);
  expect(s.scale(-5)).toBe('rgb(255,128,128)');
  expect(s.scale(50)).toBe('rgb(128,192,128)');
  expect(s.scale(75)).toBe('rgb(64,160,64)');
  s.domain([4, 2, 1]).range([1, 2, 4]);
  expect(s.scale(1.5)).toBe(3);
  expect(s.scale(3)).toBe(1.5);
  expect(s.invert(1.5)).toBe(3);
  expect(s.invert(3)).toBe(1.5);
  s.domain([1, 2, 4]).range([4, 2, 1]);
  expect(s.scale(1.5)).toBe(3);
  expect(s.scale(3)).toBe(1.5);
  expect(s.invert(1.5)).toBe(3);
  expect(s.invert(3)).toBe(1.5);
});

it('pow.invert(y) maps a range value y to a domain value x', () => {
  expect(new PowScale().range([1, 2]).invert(1.5)).toBe(0.5);
});

it('pow.invert(y) maps an empty range to the middle of the domain', () => {
  expect(new PowScale().domain([1, 2]).range([0, 0]).invert(0)).toBe(1.5);
  expect(new PowScale().domain([2, 1]).range([0, 0]).invert(1)).toBe(1.5);
});

it('pow.invert(y) coerces range values to numbers', () => {
  expect(new PowScale().range(['0', '2']).invert('1')).toBeCloseTo(0.5);
  expect(
    new PowScale().range([new Date(1990, 0, 1), new Date(1991, 0, 1)]).invert(new Date(1990, 6, 2, 13))
  ).toBeCloseTo(0.5);
});

it('pow.invert(y) returns NaN if the range is not coercible to number', () => {
  expect(isNaN(new PowScale().range(['#000', '#fff']).invert('#999'))).toBeTruthy();
  expect(isNaN(new PowScale().range([0, '#fff']).invert('#999'))).toBeTruthy();
});

it('pow.exponent(exponent) sets the exponent to the specified value', () => {
  const x = new PowScale().exponent(0.5).domain([1, 2]);
  expect(x.scale(1)).toBeCloseTo(0, 6);
  expect(x.scale(1.5)).toBeCloseTo(0.5425821, 6);
  expect(x.scale(2)).toBeCloseTo(1, 6);
  expect(x.exponent()).toBe(0.5);
  x.exponent(2).domain([1, 2]);
  expect(x.scale(1)).toBeCloseTo(0, 6);
  expect(x.scale(1.5)).toBeCloseTo(0.41666667, 6);
  expect(x.scale(2)).toBeCloseTo(1, 6);
  expect(x.exponent()).toBe(2);
  x.exponent(-1).domain([1, 2]);
  expect(x.scale(1)).toBeCloseTo(0, 6);
  expect(x.scale(1.5)).toBeCloseTo(0.6666667, 6);
  expect(x.scale(2)).toBeCloseTo(1, 6);
  expect(x.exponent()).toBe(-1);
});

it('pow.exponent(exponent) changing the exponent does not change the domain or range', () => {
  const x = new PowScale().domain([1, 2]).range([3, 4]);
  x.exponent(0.5);
  expect(x.domain()).toEqual([1, 2]);
  expect(x.range()).toEqual([3, 4]);
  x.exponent(2);
  expect(x.domain()).toEqual([1, 2]);
  expect(x.range()).toEqual([3, 4]);
  x.exponent(-1);
  expect(x.domain()).toEqual([1, 2]);
  expect(x.range()).toEqual([3, 4]);
});

it('pow.domain(domain) accepts an array of numbers', () => {
  expect(new PowScale().domain([]).domain()).toEqual([]);
  expect(new PowScale().domain([1, 0]).domain()).toEqual([1, 0]);
  expect(new PowScale().domain([1, 2, 3]).domain()).toEqual([1, 2, 3]);
});

it('pow.domain(domain) coerces domain values to numbers', () => {
  const domain = new PowScale().domain([new Date(1990, 0, 1), new Date(1991, 0, 1)]).domain();
  expect(domain[0] / 10000000000).toBeCloseTo(631123200000 / 10000000000, 2);
  expect(domain[1] / 10000000000).toBeCloseTo(662659200000 / 10000000000, 2);
  expect(new PowScale().domain(['0.0', '1.0']).domain()).toEqual([0, 1]);
  expect(new PowScale().domain([0, 1]).domain()).toEqual([0, 1]);
});

it('pow.domain(domain) makes a copy of domain values', () => {
  const d = [1, 2];
  const s = new PowScale().domain(d);
  expect(s.domain()).toEqual([1, 2]);
  d.push(3);
  expect(s.domain()).toEqual([1, 2]);
  expect(d).toEqual([1, 2, 3]);
});

it('pow.domain() returns a copy of domain values', () => {
  const s = new PowScale();
  const d = s.domain();
  expect(d).toEqual([0, 1]);
  d.push(3);
  expect(s.domain()).toEqual([0, 1]);
});

it('pow.range(range) can accept range values as colors', () => {
  expect(new PowScale().range(['red', 'blue']).scale(0.5)).toBe('rgb(128,0,128)');
  expect(new PowScale().range(['rgb(255,0,0)', '#0000ff']).scale(0.5)).toBe('rgb(128,0,128)');
  expect(new PowScale().range(['#f00', '#00f']).scale(0.5)).toBe('rgb(128,0,128)');
  //   expect(new PowScale().range(['rgb(255,0,0)', 'hsl(240,100%,50%)']).scale(0.5)).toBe('rgb(128,0,128)');
  //   expect(new PowScale().range(['rgb(100%,0%,0%)', 'hsl(240,100%,50%)']).scale(0.5)).toBe('rgb(128,0,128)');
  //   expect(new PowScale().range(['hsl(0,100%,50%)', 'hsl(240,100%,50%)']).scale(0.5)).toBe('rgb(128,0,128)');
});

it('pow.range(range) makes a copy of range values', () => {
  const r = [1, 2];
  const s = new PowScale().range(r);
  expect(s.range()).toEqual([1, 2]);
  r.push(3);
  expect(s.range()).toEqual([1, 2]);
  expect(r).toEqual([1, 2, 3]);
});

it('pow.range() returns a copy of range values', () => {
  const s = new PowScale();
  const r = s.range();
  expect(r).toEqual([0, 1]);
  r.push(3);
  expect(s.range()).toEqual([0, 1]);
});

it('pow.rangeRound(range) is an alias for pow.range(range).interpolate(interpolateRound)', () => {
  expect(new PowScale().rangeRound([0, 10]).scale(0.59)).toBe(6);
});

it('pow.clamp() is false by default', () => {
  expect(new PowScale().clamp()).toBeFalsy();
  expect(new PowScale().range([10, 20]).scale(2)).toBe(30);
  expect(new PowScale().range([10, 20]).scale(-1)).toBe(0);
  expect(new PowScale().range([10, 20]).invert(30)).toBe(2);
  expect(new PowScale().range([10, 20]).invert(0)).toBe(-1);
});

it('pow.clamp(true) restricts output values to the range', () => {
  expect(new PowScale().clamp(true).range([10, 20]).scale(2)).toBe(20);
  expect(new PowScale().clamp(true).range([10, 20]).scale(-1)).toBe(10);
});

it('pow.clamp(true) restricts input values to the domain', () => {
  expect(new PowScale().clamp(true).range([10, 20]).invert(30)).toBe(1);
  expect(new PowScale().clamp(true).range([10, 20]).invert(0)).toBe(0);
});

it('pow.clamp(clamp) coerces the specified clamp value to a boolean', () => {
  expect((new PowScale() as any).clamp('true').clamp()).toBeTruthy();
  expect((new PowScale() as any).clamp(1).clamp()).toBeTruthy();
  expect((new PowScale() as any).clamp('').clamp()).toBeFalsy();
  expect((new PowScale() as any).clamp(0).clamp()).toBeFalsy();
});

it('pow.nice() is an alias for pow.nice(10)', () => {
  expect(new PowScale().domain([0, 0.96]).nice().domain()).toEqual([0, 1]);
  expect(new PowScale().domain([0, 96]).nice().domain()).toEqual([0, 100]);
});

it('pow.nice(count) extends the domain to match the desired ticks', () => {
  expect(new PowScale().domain([0, 0.96]).nice(10).domain()).toEqual([0, 1]);
  expect(new PowScale().domain([0, 96]).nice(10).domain()).toEqual([0, 100]);
  expect(new PowScale().domain([0.96, 0]).nice(10).domain()).toEqual([1, 0]);
  expect(new PowScale().domain([96, 0]).nice(10).domain()).toEqual([100, 0]);
  expect(new PowScale().domain([0, -0.96]).nice(10).domain()).toEqual([0, -1]);
  expect(new PowScale().domain([0, -96]).nice(10).domain()).toEqual([0, -100]);
  expect(new PowScale().domain([-0.96, 0]).nice(10).domain()).toEqual([-1, 0]);
  expect(new PowScale().domain([-96, 0]).nice(10).domain()).toEqual([-100, 0]);
});

it('pow.nice(count) nices the domain, extending it to round numbers', () => {
  expect(new PowScale().domain([1.1, 10.9]).nice(10).domain()).toEqual([1, 11]);
  expect(new PowScale().domain([10.9, 1.1]).nice(10).domain()).toEqual([11, 1]);
  expect(new PowScale().domain([0.7, 11.001]).nice(10).domain()).toEqual([0, 12]);
  expect(new PowScale().domain([123.1, 6.7]).nice(10).domain()).toEqual([130, 0]);
  expect(new PowScale().domain([0, 0.49]).nice(10).domain()).toEqual([0, 0.5]);
});

it('pow.nice(count) has no effect on degenerate domains', () => {
  expect(new PowScale().domain([0, 0]).nice(10).domain()).toEqual([0, 0]);
  expect(new PowScale().domain([0.5, 0.5]).nice(10).domain()).toEqual([0.5, 0.5]);
});

it('pow.nice(count) nicing a polypow domain only affects the extent', () => {
  expect(new PowScale().domain([1.1, 1, 2, 3, 10.9]).nice(10).domain()).toEqual([1, 1, 2, 3, 11]);
  expect(new PowScale().domain([123.1, 1, 2, 3, -0.9]).nice(10).domain()).toEqual([130, 1, 2, 3, -10]);
});

it('pow.nice(count) accepts a tick count to control nicing step', () => {
  expect(new PowScale().domain([12, 87]).nice(5).domain()).toEqual([0, 100]);
  expect(new PowScale().domain([12, 87]).nice(10).domain()).toEqual([10, 90]);
  expect(new PowScale().domain([12, 87]).nice(100).domain()).toEqual([12, 87]);
});

it('pow.ticks.scale(count) returns the expected ticks for an ascending domain', () => {
  const s = new PowScale();
  expect(s.ticks(10).map(roundEpsilon)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  expect(s.ticks(9).map(roundEpsilon)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  expect(s.ticks(8).map(roundEpsilon)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  expect(s.ticks(7).map(roundEpsilon)).toEqual([0.0, 0.2, 0.4, 0.6, 0.8, 1.0]);
  expect(s.ticks(6).map(roundEpsilon)).toEqual([0.0, 0.2, 0.4, 0.6, 0.8, 1.0]);
  expect(s.ticks(5).map(roundEpsilon)).toEqual([0.0, 0.2, 0.4, 0.6, 0.8, 1.0]);
  expect(s.ticks(4).map(roundEpsilon)).toEqual([0.0, 0.2, 0.4, 0.6, 0.8, 1.0]);
  expect(s.ticks(3).map(roundEpsilon)).toEqual([0.0, 0.5, 1.0]);
  expect(s.ticks(2).map(roundEpsilon)).toEqual([0.0, 0.5, 1.0]);
  expect(s.ticks(1).map(roundEpsilon)).toEqual([0.0, 1.0]);
  s.domain([-100, 100]);
  expect(s.ticks(10)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]);
  expect(s.ticks(9)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]);
  expect(s.ticks(8)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]);
  expect(s.ticks(7)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]);
  expect(s.ticks(6)).toEqual([-100, -50, 0, 50, 100]);
  expect(s.ticks(5)).toEqual([-100, -50, 0, 50, 100]);
  expect(s.ticks(4)).toEqual([-100, -50, 0, 50, 100]);
  expect(s.ticks(3)).toEqual([-100, -50, 0, 50, 100]);
  expect(s.ticks(2)).toEqual([-100, 0, 100]);
  expect(s.ticks(1)).toEqual([0]);
});

it('pow.ticks(count) returns the expected ticks for a descending domain', () => {
  const s = new PowScale().domain([1, 0]);
  expect(s.ticks(10).map(roundEpsilon)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].reverse());
  expect(s.ticks(9).map(roundEpsilon)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].reverse());
  expect(s.ticks(8).map(roundEpsilon)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].reverse());
  expect(s.ticks(7).map(roundEpsilon)).toEqual([0.0, 0.2, 0.4, 0.6, 0.8, 1.0].reverse());
  expect(s.ticks(6).map(roundEpsilon)).toEqual([0.0, 0.2, 0.4, 0.6, 0.8, 1.0].reverse());
  expect(s.ticks(5).map(roundEpsilon)).toEqual([0.0, 0.2, 0.4, 0.6, 0.8, 1.0].reverse());
  expect(s.ticks(4).map(roundEpsilon)).toEqual([0.0, 0.2, 0.4, 0.6, 0.8, 1.0].reverse());
  expect(s.ticks(3).map(roundEpsilon)).toEqual([0.0, 0.5, 1.0].reverse());
  expect(s.ticks(2).map(roundEpsilon)).toEqual([0.0, 0.5, 1.0].reverse());
  expect(s.ticks(1).map(roundEpsilon)).toEqual([0.0, 1.0].reverse());
  s.domain([100, -100]);
  expect(s.ticks(10)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100].reverse());
  expect(s.ticks(9)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100].reverse());
  expect(s.ticks(8)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100].reverse());
  expect(s.ticks(7)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100].reverse());
  expect(s.ticks(6)).toEqual([-100, -50, 0, 50, 100].reverse());
  expect(s.ticks(5)).toEqual([-100, -50, 0, 50, 100].reverse());
  expect(s.ticks(4)).toEqual([-100, -50, 0, 50, 100].reverse());
  expect(s.ticks(3)).toEqual([-100, -50, 0, 50, 100].reverse());
  expect(s.ticks(2)).toEqual([-100, 0, 100].reverse());
  expect(s.ticks(1)).toEqual([0].reverse());
});

it('pow.ticks(count) returns the expected ticks for a polypow domain', () => {
  const s = new PowScale().domain([0, 0.25, 0.9, 1]);
  expect(s.ticks(10).map(roundEpsilon)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  expect(s.ticks(9).map(roundEpsilon)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  expect(s.ticks(8).map(roundEpsilon)).toEqual([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
  expect(s.ticks(7).map(roundEpsilon)).toEqual([0.0, 0.2, 0.4, 0.6, 0.8, 1.0]);
  expect(s.ticks(6).map(roundEpsilon)).toEqual([0.0, 0.2, 0.4, 0.6, 0.8, 1.0]);
  expect(s.ticks(5).map(roundEpsilon)).toEqual([0.0, 0.2, 0.4, 0.6, 0.8, 1.0]);
  expect(s.ticks(4).map(roundEpsilon)).toEqual([0.0, 0.2, 0.4, 0.6, 0.8, 1.0]);
  expect(s.ticks(3).map(roundEpsilon)).toEqual([0.0, 0.5, 1.0]);
  expect(s.ticks(2).map(roundEpsilon)).toEqual([0.0, 0.5, 1.0]);
  expect(s.ticks(1).map(roundEpsilon)).toEqual([0.0, 1.0]);
  s.domain([-100, 0, 100]);
  expect(s.ticks(10)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]);
  expect(s.ticks(9)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]);
  expect(s.ticks(8)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]);
  expect(s.ticks(7)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]);
  expect(s.ticks(6)).toEqual([-100, -50, 0, 50, 100]);
  expect(s.ticks(5)).toEqual([-100, -50, 0, 50, 100]);
  expect(s.ticks(4)).toEqual([-100, -50, 0, 50, 100]);
  expect(s.ticks(3)).toEqual([-100, -50, 0, 50, 100]);
  expect(s.ticks(2)).toEqual([-100, 0, 100]);
  expect(s.ticks(1)).toEqual([0]);
});

it('pow.ticks(count) returns the empty array if count is not a positive integer', () => {
  const s = new PowScale();
  expect(s.ticks(NaN)).toEqual([]);
  expect(s.ticks(0)).toEqual([]);
  expect(s.ticks(-1)).toEqual([]);
  expect(s.ticks(Infinity)).toEqual([]);
});

it('pow.ticks() is an alias for pow.ticks(10)', () => {
  const s = new PowScale();
  expect(s.ticks()).toEqual(s.ticks(10));
});

it('pow.clone() returns a copy with changes to the domain are isolated', () => {
  const x = new PowScale();
  const y = x.clone();
  x.domain([1, 2]);
  expect(y.domain()).toEqual([0, 1]);
  expect(x.scale(1)).toBe(0);
  expect(y.scale(1)).toBe(1);
  y.domain([2, 3]);
  expect(x.scale(2)).toBe(1);
  expect(y.scale(2)).toBe(0);
  expect(x.domain()).toEqual([1, 2]);
  expect(y.domain()).toEqual([2, 3]);
  const y1 = x.domain([1, 1.9]).clone();
  x.nice(5);
  expect(x.domain()).toEqual([1, 2]);
  expect(y1.domain()).toEqual([1, 1.9]);
});

it('pow.clone() returns a copy with changes to the range are isolated', () => {
  const x = new PowScale();
  const y = x.clone();
  x.range([1, 2]);
  expect(x.invert(1)).toBe(0);
  expect(y.invert(1)).toBe(1);
  expect(y.range()).toEqual([0, 1]);
  y.range([2, 3]);
  expect(x.invert(2)).toBe(1);
  expect(y.invert(2)).toBe(0);
  expect(x.range()).toEqual([1, 2]);
  expect(y.range()).toEqual([2, 3]);
});

it('pow.clone() returns a copy with changes to the interpolator are isolated', () => {
  const x = new PowScale().range(['red', 'blue']);
  const y = x.clone();
  const i0 = x.interpolate();
  const i1 = function (a: number, b: number) {
    return function () {
      return b;
    };
  };
  x.interpolate(i1);
  expect(y.interpolate()).toBe(i0);
  expect(x.scale(0.5)).toBe('blue');
  expect(y.scale(0.5)).toBe('rgb(128,0,128)');
});

it('pow.clone() returns a copy with changes to clamping are isolated', () => {
  const x = new PowScale().clamp(true);
  const y = x.clone();
  x.clamp(false);
  expect(x.scale(2)).toBe(2);
  expect(y.scale(2)).toBe(1);
  expect(y.clamp()).toBeTruthy();
  y.clamp(false);
  expect(x.scale(2)).toBe(2);
  expect(y.scale(2)).toBe(2);
  expect(x.clamp()).toBeFalsy();
});

it('pow().clamp(true).invert(x) cannot return a value outside the domain', () => {
  const x = new PowScale().exponent(0.5).domain([1, 20]).clamp(true);
  expect(x.invert(0)).toBe(1);
  expect(x.invert(1)).toBe(20);
});
