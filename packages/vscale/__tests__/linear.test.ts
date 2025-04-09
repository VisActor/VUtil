import { wilkinsonExtended } from '../src';
import { LinearScale } from '../src/linear-scale';

function roundEpsilon(x: number) {
  return Math.round(x * 1e12) / 1e12;
}

test('scaleLinear() has the expected defaults', function () {
  const s = new LinearScale();
  expect(s.domain()).toEqual([0, 1]);
  expect(s.range()).toEqual([0, 1]);
  expect(s.clamp()).toBe(false);
  expect(s.unknown()).toBe(undefined);
  expect(s.interpolate()(0, 100)(0.5)).toEqual(50);
});

test('scaleLinear(range) sets the range', function () {
  const s = new LinearScale().range([1, 2]);
  expect(s.domain()).toEqual([0, 1]);
  expect(s.range()).toEqual([1, 2]);
  expect(s.scale(0.5)).toBe(1.5);
});

test('scaleLinear(domain, range) sets the domain and range', function () {
  const s = new LinearScale().domain([1, 2]).range([3, 4]);
  expect(s.domain()).toEqual([1, 2]);
  expect(s.range()).toEqual([3, 4]);
  expect(s.scale(1.5)).toBe(3.5);
});

test('linear(x) maps a domain value x to a range value y', function () {
  expect(new LinearScale().range([1, 2]).scale(0.5)).toBe(1.5);
});

test('linear(x) ignores extra range values when forceAlignDomainRange(false)', () => {
  expect(new LinearScale().domain([-10, 0]).forceAlignDomainRange(false).range([0, 1, 2]).clamp(true).scale(-5)).toBe(
    0.5
  );
  expect(new LinearScale().domain([-10, 0]).forceAlignDomainRange(false).range([0, 1, 2]).clamp(true).scale(50)).toBe(
    1
  );
});

test('linear(x) ignores extra domain values when forceAlignDomainRange(false)', () => {
  expect(new LinearScale().forceAlignDomainRange(false).domain([-10, 0, 100]).range([0, 1]).clamp(true).scale(-5)).toBe(
    0.5
  );
  expect(new LinearScale().forceAlignDomainRange(false).domain([-10, 0, 100]).range([0, 1]).clamp(true).scale(50)).toBe(
    1
  );
});

test('linear(x) will not ignores extra range values if the domain is smaller than the range', function () {
  expect(new LinearScale().domain([-10, 0]).range(['green', 'red', 'blue']).clamp(true).scale(-5)).toBe('rgb(255,0,0)');
  expect(new LinearScale().domain([-10, 0]).range(['green', 'red', 'blue']).clamp(true).scale(50)).toBe('rgb(0,0,255)');

  expect(
    new LinearScale()
      .forceAlignDomainRange(false)
      .domain([-10, 0])
      .range(['green', 'red', 'blue'])
      .clamp(true)
      .scale(-5)
  ).toBe('rgb(128,64,0)');
  expect(
    new LinearScale()
      .forceAlignDomainRange(false)
      .domain([-10, 0])
      .range(['green', 'red', 'blue'])
      .clamp(true)
      .scale(50)
  ).toBe('rgb(255,0,0)');
});

test('linear(x) will not ignores extra domain values if the range is smaller than the domain', function () {
  expect(new LinearScale().domain([-10, 0, 100]).range([0, 1]).clamp(true).scale(-5)).toBe(0.5);
  expect(new LinearScale().domain([-10, 0, 100]).range([0, 1]).clamp(true).scale(50)).toBe(1);
});

test('linear(x) maps an empty domain to the middle of the range', function () {
  expect(new LinearScale().domain([0, 0]).range([1, 2]).scale(0)).toBe(1.5);
  expect(new LinearScale().domain([0, 0]).range([2, 1]).scale(1)).toBe(1.5);
});

test('linear(x) can map a bilinear domain with two values to the corresponding range', function () {
  const s = new LinearScale().domain([1, 2]);
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

test('linear(x) can map a polylinear domain with more than two values to the corresponding range', function () {
  const s = new LinearScale().domain([-10, 0, 100]).range(['red', 'white', 'green']);
  expect(s.domain()).toEqual([-10, 0, 100]);

  // 暂时不支持颜色差值
  // expect(s.scale(-5)).toBe('rgb(255, 128, 128)');
  // expect(s.scale(50)).toBe('rgb(128, 192, 128)');
  // expect(s.scale(75)).toBe('rgb(64, 160, 64)');
  s.domain([4, 2, 1]).range([1, 2, 4]);
  expect(s.scale(1.5)).toBe(3);
  expect(s.scale(3)).toBe(1.5);
  expect(s.invert(1.5)).toBe(3);
  expect(s.invert(3)).toBe(1.5);
  s.domain([1, 2, 4]).range([4, 2, 1]);
  expect(s.scale(1.5)).toBe(3);
  // TODO
  expect(s.scale(3)).toBe(1.5);
  // TODO
  expect(s.invert(1.5)).toBe(3);
  expect(s.invert(3)).toBe(1.5);
});

test('linear.invert(y) maps a range value y to a domain value x', function () {
  expect(new LinearScale().range([1, 2]).invert(1.5)).toBe(0.5);
});

test('linear.invert(y) maps an empty range to the middle of the domain', function () {
  expect(new LinearScale().domain([1, 2]).range([0, 0]).invert(0)).toBe(1.5);
  expect(new LinearScale().domain([2, 1]).range([0, 0]).invert(1)).toBe(1.5);
});

test('linear.invert(y) coerces range values to numbers', function () {
  expect((new LinearScale() as any).range(['0', '2']).invert('1')).toBeCloseTo(0.5);
  expect(
    (new LinearScale() as any).range([new Date(1990, 0, 1), new Date(1991, 0, 1)]).invert(new Date(1990, 6, 2, 13))
  ).toBeCloseTo(0.5);
});

test('linear.invert(y) returns NaN if the range is not coercible to number', function () {
  expect(isNaN((new LinearScale() as any).range(['#000', '#fff']).invert('#999'))).toBeTruthy();
  expect(isNaN((new LinearScale() as any).range([0, '#fff']).invert('#999'))).toBeTruthy();
});

test('linear.domain(domain) accepts an array of numbers', function () {
  expect(new LinearScale().domain([]).domain()).toEqual([]);
  expect(new LinearScale().domain([1, 0]).domain()).toEqual([1, 0]);
  expect(new LinearScale().domain([1, 2, 3]).domain()).toEqual([1, 2, 3]);
});

test('linear.domain(domain) coerces domain values to numbers', function () {
  const domain = new LinearScale().domain([new Date(1990, 0, 1), new Date(1991, 0, 1)]).domain();
  expect(domain[0] / 10000000000).toBeCloseTo(631123200000 / 10000000000, 2);
  expect(domain[1] / 10000000000).toBeCloseTo(662659200000 / 10000000000, 2);
  expect(new LinearScale().domain(['0.0', '1.0']).domain()).toEqual([0, 1]);
  expect(new LinearScale().domain([Number(0), Number(1)]).domain()).toEqual([0, 1]);
});

test('linear.domain(domain) accepts an iterable', function () {
  expect((new LinearScale() as any).domain(new Set([1, 2])).domain()).toEqual([1, 2]);
});

test('linear.domain(domain) makes a copy of domain values', function () {
  const d = [1, 2];
  const s = new LinearScale().domain(d);
  expect(s.domain()).toEqual([1, 2]);
  d.push(3);
  expect(s.domain()).toEqual([1, 2]);
  expect(d).toEqual([1, 2, 3]);
});

test('linear.domain() returns a copy of domain values', function () {
  const s = new LinearScale();
  const d = s.domain();
  expect(d).toEqual([0, 1]);
  d.push(3);
  expect(s.domain()).toEqual([0, 1]);
});

test('linear.range(range) does not coerce range to numbers', function () {
  const s = new LinearScale().range(['0px', '2px']);
  expect(s.range()).toEqual(['0px', '2px']);
  // expect(s.scale(0.5)).toBe('1px');
});

test('linear.range(range) accepts an iterable', function () {
  expect((new LinearScale() as any).range(new Set([1, 2])).range()).toEqual([1, 2]);
});

// test('linear.range(range) can accept range values as colors', function () {
//   expect(new LinearScale().range(['red', 'blue']).scale(0.5)).toBe('rgb(128, 0, 128)');
//   expect(new LinearScale().range(['#ff0000', '#0000ff']).scale(0.5)).toBe('rgb(128, 0, 128)');
//   expect(new LinearScale().range(['#f00', '#00f']).scale(0.5)).toBe('rgb(128, 0, 128)');
//   expect(new LinearScale().range(['rgb(255,0,0)', 'hsl(240,100%,50%)']).scale(0.5)).toBe('rgb(128, 0, 128)');
//   expect(new LinearScale().range(['rgb(100%,0%,0%)', 'hsl(240,100%,50%)']).scale(0.5)).toBe('rgb(128, 0, 128)');
//   expect(new LinearScale().range(['hsl(0,100%,50%)', 'hsl(240,100%,50%)']).scale(0.5)).toBe('rgb(128, 0, 128)');
// });

// test('linear.range(range) can accept range values as arrays or objects', function () {
//   expect(new LinearScale().range([{ color: 'red' }, { color: 'blue' }]).scale(0.5)).toEqual({
//     color: 'rgb(128, 0, 128)'
//   });
//   expect(new LinearScale().range([['red'], ['blue']]).scale(0.5)).toEqual(['rgb(128, 0, 128)']);
// });

test('linear.range(range) makes a copy of range values', function () {
  const r = [1, 2];
  const s = new LinearScale().range(r);
  expect(s.range()).toEqual([1, 2]);
  r.push(3);
  expect(s.range()).toEqual([1, 2]);
  expect(r).toEqual([1, 2, 3]);
});

test('linear.range() returns a copy of range values', function () {
  const s = new LinearScale();
  const r = s.range();
  expect(r).toEqual([0, 1]);
  r.push(3);
  expect(s.range()).toEqual([0, 1]);
});

test('linear.rangeRound(range) is an alias for linear.range(range).interpolate(interpolateRound)', function () {
  expect(new LinearScale().rangeRound([0, 10]).scale(0.59)).toBe(6);
});

test('linear.rangeRound(range) accepts an iterable', function () {
  expect((new LinearScale() as any).rangeRound(new Set([1, 2])).range()).toEqual([1, 2]);
});

test('linear.unknown(value) sets the return value for undefined and NaN input', function () {
  const s = new LinearScale().unknown(-1);
  expect(s.scale(undefined)).toBe(-1);
  expect(s.scale(NaN)).toBe(-1);
  expect(s.scale('N/A')).toBe(-1);
  expect(s.scale(0.4)).toBe(0.4);
});

test('linear.clamp() is false by default', function () {
  expect(new LinearScale().clamp()).toBe(false);
  expect(new LinearScale().range([10, 20]).scale(2)).toBe(30);
  expect(new LinearScale().range([10, 20]).scale(-1)).toBe(0);
  expect(new LinearScale().range([10, 20]).invert(30)).toBe(2);
  expect(new LinearScale().range([10, 20]).invert(0)).toBe(-1);
});

test('linear.clamp(true) restricts output values to the range', function () {
  expect(new LinearScale().clamp(true).range([10, 20]).scale(2)).toBe(20);
  expect(new LinearScale().clamp(true).range([10, 20]).scale(-1)).toBe(10);
});

test('linear.clamp(true) restricts input values to the domain', function () {
  expect(new LinearScale().clamp(true).range([10, 20]).invert(30)).toBe(1);
  expect(new LinearScale().clamp(true).range([10, 20]).invert(0)).toBe(0);
});

test('linear.clamp(clamp) coerces the specified clamp value to a boolean', function () {
  expect((new LinearScale() as any).clamp('true').clamp()).toBe(true);
  expect((new LinearScale() as any).clamp(1).clamp()).toBe(true);
  expect((new LinearScale() as any).clamp('').clamp()).toBe(false);
  expect((new LinearScale() as any).clamp(0).clamp()).toBe(false);
});

test('linear.interpolate(interpolate) takes a custom interpolator factory', function () {
  function interpolate(a: number, b: number) {
    return function (t: number) {
      return [a, b, t];
    };
  }
  const s = (new LinearScale() as any).domain([10, 20]).range(['a', 'b']).interpolate(interpolate);
  expect(s.interpolate()).toBe(interpolate);
  expect(s.scale(15)).toEqual(['a', 'b', 0.5]);
});

test('linear.nice() is an alias for linear.nice(10)', function () {
  expect(new LinearScale().domain([0, 0.96]).nice().domain()).toEqual([0, 1]);
  expect(new LinearScale().domain([0, 96]).nice().domain()).toEqual([0, 100]);
});

test('linear.nice(count) extends the domain to match the desired ticks', function () {
  expect(new LinearScale().domain([0, 0.96]).nice(10).domain()).toEqual([0, 1]);
  expect(new LinearScale().domain([0, 96]).nice(10).domain()).toEqual([0, 100]);
  expect(new LinearScale().domain([0.96, 0]).nice(10).domain()).toEqual([1, 0]);
  expect(new LinearScale().domain([96, 0]).nice(10).domain()).toEqual([100, 0]);
  expect(new LinearScale().domain([0, -0.96]).nice(10).domain()).toEqual([0, -1]);
  expect(new LinearScale().domain([0, -96]).nice(10).domain()).toEqual([0, -100]);
  expect(new LinearScale().domain([-0.96, 0]).nice(10).domain()).toEqual([-1, 0]);
  expect(new LinearScale().domain([-96, 0]).nice(10).domain()).toEqual([-100, 0]);
  expect(new LinearScale().domain([-0.1, 51.1]).nice(8).domain()).toEqual([-10, 60]);
});

test('linear.nice(count) nices the domain, extending it to round numbers', function () {
  expect(new LinearScale().domain([1.1, 10.9]).nice(10).domain()).toEqual([1, 11]);
  expect(new LinearScale().domain([10.9, 1.1]).nice(10).domain()).toEqual([11, 1]);
  expect(new LinearScale().domain([0.7, 11.001]).nice(10).domain()).toEqual([0, 12]);
  expect(new LinearScale().domain([123.1, 6.7]).nice(10).domain()).toEqual([130, 0]);
  expect(new LinearScale().domain([0, 0.49]).nice(10).domain()).toEqual([0, 0.5]);
  expect(new LinearScale().domain([0, 14.1]).nice(5).domain()).toEqual([0, 20]);
  expect(new LinearScale().domain([0, 15]).nice(5).domain()).toEqual([0, 20]);
});

test('linear.nice(count) has no effect on degenerate domains', function () {
  expect(new LinearScale().domain([0, 0]).nice(10).domain()).toEqual([0, 0]);
  expect(new LinearScale().domain([0.5, 0.5]).nice(10).domain()).toEqual([0.5, 0.5]);
});

test('linear.nice(count) nicing a polylinear domain only affects the extent', function () {
  expect(new LinearScale().domain([1.1, 1, 2, 3, 10.9]).nice(10).domain()).toEqual([1, 1, 2, 3, 11]);
  expect(new LinearScale().domain([123.1, 1, 2, 3, -0.9]).nice(10).domain()).toEqual([130, 1, 2, 3, -10]);
});

test('linear.nice(count) accepts a tick count to control nicing step', function () {
  expect(new LinearScale().domain([12, 87]).nice(5).domain()).toEqual([0, 100]);
  expect(new LinearScale().domain([12, 87]).nice(10).domain()).toEqual([10, 90]);
  expect(new LinearScale().domain([12, 87]).nice(100).domain()).toEqual([12, 87]);
});

test('linear.ticks(count) returns the expected ticks for an ascending domain', function () {
  const s = new LinearScale();
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

test('linear.forceTicks(count) returns the expected ticks for an ascending domain', function () {
  const s = new LinearScale();
  expect(s.forceTicks(10).map(roundEpsilon)).toEqual(
    new Array(10)
      .fill(0)
      .map((item, index) => (1 / 9) * index)
      .map(roundEpsilon)
  );
  expect(s.forceTicks(9).map(roundEpsilon)).toEqual(
    new Array(9)
      .fill(0)
      .map((item, index) => (1 / 8) * index)
      .map(roundEpsilon)
  );
  expect(s.forceTicks(8).map(roundEpsilon)).toEqual(
    new Array(8)
      .fill(0)
      .map((item, index) => (1 / 7) * index)
      .map(roundEpsilon)
  );
  expect(s.forceTicks(2).map(roundEpsilon)).toEqual(
    new Array(2)
      .fill(0)
      .map((item, index) => (1 / 1) * index)
      .map(roundEpsilon)
  );
  expect(s.forceTicks(1).map(roundEpsilon)).toEqual([0.0]);
  s.domain([-100, 100]);
  expect(s.forceTicks(10)).toEqual(new Array(10).fill(0).map((item, index) => -100 + (200 / 9) * index));
  expect(s.forceTicks(9)).toEqual(new Array(9).fill(0).map((item, index) => -100 + (200 / 8) * index));
  expect(s.forceTicks(8)).toEqual(new Array(8).fill(0).map((item, index) => -100 + (200 / 7) * index));
  expect(s.forceTicks(2)).toEqual(new Array(2).fill(0).map((item, index) => -100 + (200 / 1) * index));
  expect(s.forceTicks(1)).toEqual([-100]);
});

test('linear.stepTicks(count) returns the expected ticks for an ascending domain', function () {
  const s = new LinearScale();
  s.domain([0, 100]);
  expect(s.stepTicks(10)).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  expect(s.stepTicks(20)).toEqual([0, 20, 40, 60, 80, 100]);
  expect(s.stepTicks(30)).toEqual([0, 30, 60, 90]);
  expect(s.stepTicks(40)).toEqual([0, 40, 80]);
  expect(s.stepTicks(50)).toEqual([0, 50, 100]);
  expect(s.stepTicks(60)).toEqual([0, 60]);
});

test('linear.niceMin(count) returns the expected ticks for an ascending domain', function () {
  expect(new LinearScale().domain([12, 87]).niceMin(5).domain()).toEqual([0, 87]);
  expect(new LinearScale().domain([12, 87]).niceMin(10).domain()).toEqual([10, 87]);
  expect(new LinearScale().domain([12, 87]).niceMin(100).domain()).toEqual([12, 87]);
});

test('linear.niceMax(count) returns the expected ticks for an ascending domain', function () {
  expect(new LinearScale().domain([12, 87]).niceMax(5).domain()).toEqual([12, 100]);
  expect(new LinearScale().domain([12, 87]).niceMax(10).domain()).toEqual([12, 90]);
  expect(new LinearScale().domain([12, 87]).niceMax(100).domain()).toEqual([12, 87]);
});

test('linear.ticks(count) returns the expected ticks for a descending domain', function () {
  const s = new LinearScale().domain([1, 0]);
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

test('linear.ticks(count) returns the expected ticks for a polylinear domain', function () {
  const s = new LinearScale().domain([0, 0.25, 0.9, 1]);
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

test('linear.ticks(X) spans linear.nice(X).domain()', function () {
  function check(domain: any[], count: number) {
    const s = new LinearScale().domain(domain).nice(count);
    const ticks = s.d3Ticks(count);
    expect([ticks[0], ticks[ticks.length - 1]]).toEqual(s.domain());
  }

  check([1, 9], 2);
  check([1, 9], 3);
  check([1, 9], 4);

  check([8, 9], 2);
  check([8, 9], 3);
  check([8, 9], 4);

  check([1, 21], 2);
  check([2, 21], 2);
  check([3, 21], 2);
  check([4, 21], 2);
  check([5, 21], 2);
  check([6, 21], 2);
  check([7, 21], 2);
  check([8, 21], 2);
  check([9, 21], 2);
  check([10, 21], 2);
  check([11, 21], 2);
});

test('linear.ticks(count) returns the empty array if count is not a positive integer', function () {
  const s = new LinearScale();
  expect(s.ticks(NaN)).toEqual([]);
  expect(s.ticks(0)).toEqual([]);
  expect(s.ticks(-1)).toEqual([]);
  expect(s.ticks(Infinity)).toEqual([]);
});

test('linear.ticks() is an alias for linear.ticks(10)', function () {
  const s = new LinearScale();
  expect(s.ticks()).toEqual(s.ticks(10));
});

// test('linear.tickFormat() is an alias for linear.tickFormat(10)', function () {
//   // expect(new LinearScale().tickFormat(0.2)).toBe('0.2');
//   // expect(new LinearScale().domain([-100, 100]).tickFormat(-20)).toBe('-20');
// });

// test('linear.tickFormat(count) returns a format suitable for the ticks', function () {
//   expect(new LinearScale().tickFormat(10)(0.2)).toBe('0.2');
//   expect(new LinearScale().tickFormat(20)(0.2)).toBe('0.20');
//   expect(new LinearScale().domain([-100, 100]).tickFormat(10)(-20)).toBe('-20');
// });

// test('linear.tickFormat(count, specifier) sets the appropriate fixed precision if not specified', function () {
//   expect(new LinearScale().tickFormat(10, '+f')(0.2)).toBe('+0.2', notSupported_TickFormat, { todo: true });
//   expect(new LinearScale().tickFormat(20, '+f')(0.2)).toBe('+0.20', notSupported_TickFormat, { todo: true });
//   expect(new LinearScale().tickFormat(10, '+%')(0.2)).toBe('+20%', notSupported_TickFormat, { todo: true });
//   expect(new LinearScale().domain([0.19, 0.21]).tickFormat(10, '+%')(0.2)).toBe('+20.0%', notSupported_TickFormat, {
//     todo: true
//   });
// });

// test('linear.tickFormat(count, specifier) sets the appropriate round precision if not specified', function () {
//   expect(new LinearScale().domain([0, 9]).tickFormat(10, '')(2.1)).toBe('2', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 9]).tickFormat(100, '')(2.01)).toBe('2', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 9]).tickFormat(100, '')(2.11)).toBe('2.1', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 9]).tickFormat(10, 'e')(2.1)).toBe('2e+0', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 9]).tickFormat(100, 'e')(2.01)).toBe('2.0e+0', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 9]).tickFormat(100, 'e')(2.11)).toBe('2.1e+0', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 9]).tickFormat(10, 'g')(2.1)).toBe('2', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 9]).tickFormat(100, 'g')(2.01)).toBe('2.0', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 9]).tickFormat(100, 'g')(2.11)).toBe('2.1', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 9]).tickFormat(10, 'r')(2.1e6)).toBe('2000000', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 9]).tickFormat(100, 'r')(2.01e6)).toBe('2000000', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 9]).tickFormat(100, 'r')(2.11e6)).toBe('2100000', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 0.9]).tickFormat(10, 'p')(0.21)).toBe('20%', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0.19, 0.21]).tickFormat(10, 'p')(0.201)).toBe('20.1%', notSupported_TickFormat, {
//     todo: true
//   });
// });

// test('linear.tickFormat(count, specifier) sets the appropriate prefix precision if not specified', function () {
//   expect(new LinearScale().domain([0, 1e6]).tickFormat(10, '$s')(0.51e6)).toBe('$0.5M', notSupported_TickFormat, {
//     todo: true
//   });
//   expect(new LinearScale().domain([0, 1e6]).tickFormat(100, '$s')(0.501e6)).toBe('$0.50M', notSupported_TickFormat, {
//     todo: true
//   });
// });

// test('linear.tickFormat() uses the default precision when the domain is invalid', function () {
//   const f = new LinearScale().domain([0, NaN]).tickFormat();
//   expect(`${f}`).toBe(' >-,f', notSupported_TickFormat, { todo: true });
//   expect(f(0.12)).toBe('0.120000', notSupported_TickFormat, { todo: true });
// });

test('linear.clone() returns a copy with changes to the domain are isolated', function () {
  const x = new LinearScale();
  let y = x.clone();
  x.domain([1, 2]);
  expect(y.domain()).toEqual([0, 1]);
  expect(x.scale(1)).toBe(0);
  expect(y.scale(1)).toBe(1);
  y.domain([2, 3]);
  expect(x.scale(2)).toBe(1);
  expect(y.scale(2)).toBe(0);
  expect(x.domain()).toEqual([1, 2]);
  expect(y.domain()).toEqual([2, 3]);
  y = x.domain([1, 1.9]).clone();
  x.nice(5);
  expect(x.domain()).toEqual([1, 2]);
  expect(y.domain()).toEqual([1, 1.9]);
});

test('linear.clone() returns a copy with changes to the range are isolated', function () {
  const x = new LinearScale();
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

test('linear.clone() returns a copy with changes to the interpolator are isolated', function () {
  const x = new LinearScale().range(['red', 'blue']);
  const y = x.clone();
  const i0 = x.interpolate();
  const i1 = function (a: any, b: any) {
    return function () {
      return b;
    };
  };
  x.interpolate(i1);
  // expect(y.interpolate()).toBe(i0, notSupportedInterpolation, { todo: true });
  // expect(x.scale(0.5)).toBe('blue', notSupportedInterpolation, { todo: true });
  // expect(y.scale(0.5)).toBe('rgb(128, 0, 128)', notSupportedInterpolation, { todo: true });
});

test('linear.clone() returns a copy with changes to clamping are isolated', function () {
  const x = new LinearScale().clamp(true);
  const y = (x as any).clone();
  x.clamp(false);
  expect(x.scale(2)).toBe(2);
  expect(y.scale(2)).toBe(1);
  expect(y.clamp()).toBe(true);
  y.clamp(false);
  expect(x.scale(2)).toBe(2);
  expect(y.scale(2)).toBe(2);
  expect(x.clamp()).toBe(false);
});

test('linear.clone() returns a copy with changes to the unknown value are isolated', function () {
  const x = new LinearScale();
  const y = x.clone();
  x.unknown(2);
  expect(x.scale(NaN)).toBe(2);
  expect(isNaN(y.scale(NaN))).toBe(true);
  expect(y.unknown()).toBe(undefined);
  y.unknown(3);
  expect(x.scale(NaN)).toBe(2);
  expect(y.scale(NaN)).toBe(3);
  expect(x.unknown()).toBe(2);
});

// ////////
test('scaleLinear() has the expected defaults', () => {
  const s = new LinearScale();
  expect(s.domain()).toEqual([0, 1]);
  expect(s.range()).toEqual([0, 1]);
});

test('scaleLinear(range) sets the range', () => {
  const s = new LinearScale();
  s.range([1, 2]);
  expect(s.domain()).toEqual([0, 1]);
  expect(s.range()).toEqual([1, 2]);
  expect(s.scale(0.5)).toEqual(1.5);
});

test('scaleLinear(domain, range) sets the domain and range', () => {
  const s = new LinearScale();
  s.domain([1, 2]);
  s.range([3, 4]);
  expect(s.domain()).toEqual([1, 2]);
  expect(s.range()).toEqual([3, 4]);
  expect(s.scale(1.5)).toEqual(3.5);
});

test('linear(x) maps a domain value x to a range value y', () => {
  const s = new LinearScale();
  s.range([1, 2]);
  expect(s.scale(0.5)).toEqual(1.5);
});

test('linear(x) maps an empty domain to the middle of the range', () => {
  const s = new LinearScale();
  expect(s.domain([0, 0]).range([1, 2]).scale(0)).toEqual(1.5);
  expect(s.domain([0, 0]).range([2, 1]).scale(1)).toEqual(1.5);
});

test('linear(x) can map a bilinear domain with two values to the corresponding range', () => {
  const s = new LinearScale();
  s.domain([1, 2]);
  expect(s.domain()).toEqual([1, 2]);
  expect(s.scale(0.5)).toEqual(-0.5);
  expect(s.scale(1.0)).toEqual(0.0);
  expect(s.scale(1.5)).toEqual(0.5);
  expect(s.scale(2.0)).toEqual(1.0);
  expect(s.scale(2.5)).toEqual(1.5);
});

test('linear.domain(domain) accepts an array of numbers', () => {
  const s = new LinearScale();
  expect(s.domain([]).domain()).toEqual([]);
  expect(s.domain([1, 0]).domain()).toEqual([1, 0]);
  expect(s.domain([1, 2, 3]).domain()).toEqual([1, 2, 3]);
});

test('linear.domain(domain) accepts an iterable', () => {
  const s = new LinearScale();
  expect((s as any).domain(new Set([1, 2])).domain()).toEqual([1, 2]);
});

test('linear.domain(domain) makes a copy of domain values', () => {
  const s = new LinearScale();
  const d = [1, 2];
  s.domain(d);
  expect(s.domain()).toEqual([1, 2]);
  d.push(3);
  expect(s.domain()).toEqual([1, 2]);
  expect(d).toEqual([1, 2, 3]);
});

test('linear.domain() returns a copy of domain values', () => {
  const s = new LinearScale();
  const d = s.domain();
  expect(d).toEqual([0, 1]);
  d.push(3);
  expect(s.domain()).toEqual([0, 1]);
});

test('linear.range(range) accepts an iterable', () => {
  const s = new LinearScale();
  expect((s as any).range(new Set([1, 2])).range()).toEqual([1, 2]);
});

test('linear.range(range) makes a copy of range values', () => {
  const r = [1, 2];
  const s = new LinearScale().range(r);
  expect(s.range()).toEqual([1, 2]);
  r.push(3);
  expect(s.range()).toEqual([1, 2]);
  expect(r).toEqual([1, 2, 3]);
});

test('linear.range() returns a copy of range values', () => {
  const s = new LinearScale();
  const r = s.range();
  expect(r).toEqual([0, 1]);
  r.push(3);
  expect(s.range()).toEqual([0, 1]);
});

test('linear.ticks(count) when rangeFactor is not empty', function () {
  const s = new LinearScale().domain([2, 10], true).range([0, 100]);
  const tickData0 = s.ticks(5);

  expect(tickData0).toEqual([2, 4, 6, 8, 10]);
  s.rangeFactor([0, 0.5]);
  const tickData1 = s.ticks(5);

  expect(tickData1).toEqual([2, 3, 4, 5, 6]);

  s.rangeFactor([0.3, 0.5]);
  const tickData2 = s.ticks(5);
  const res = [4.5, 5, 5.5, 6];
  tickData2.forEach((d: number, i: number) => {
    expect(tickData2[i]).toBeCloseTo(res[i]);
  });
});

test('linear.ticks(count) returns the expected ticks for a negative domain', function () {
  const s = new LinearScale().domain([-1, 0]);
  expect(s.ticks(10).map(roundEpsilon)).toEqual(
    [0, -0.1, -0.2, -0.3, -0.4, -0.5, -0.6, -0.7, -0.8, -0.9, -1.0].reverse()
  );
});

test('linear.ticks(count) will update final domain of scale when nice is true', function () {
  const originDomain = [3.45, 10];
  const s = new LinearScale().domain(originDomain);

  expect(s.domain()).toEqual(originDomain);
  s.nice(5);
  expect(s.domain()).toEqual([3, 10]);
  const newTicks = s.ticks(5);
  expect(newTicks).toEqual([2, 4, 6, 8, 10]);
  expect(s.domain()).toEqual([newTicks[0], newTicks[newTicks.length - 1]]);
});

test('linear.ticks(count) will not update final domain of scale when nice is false', function () {
  const originDomain = [3.45, 10];
  const s = new LinearScale().domain(originDomain);

  expect(s.domain()).toEqual(originDomain);
  const newTicks = s.ticks(5);
  expect(newTicks).toEqual([4, 5, 6, 7, 8, 9, 10]);
  expect(s.domain()).toEqual(originDomain);
});

test('linear.ticks(count) will filter ticks when niceMin is true', function () {
  const originDomain = [3.45, 11.5];
  const s = new LinearScale().domain(originDomain);

  expect(s.domain()).toEqual(originDomain);
  s.niceMin(5);
  expect(s.domain()).toEqual([2, originDomain[1]]);

  const newTicks = s.ticks(5);
  expect(newTicks).toEqual([2, 4, 6, 8, 10]);
  expect(s.domain()).toEqual([newTicks[0], originDomain[1]]);
});

test('linear.ticks(count) will filter ticks when niceMax is true', function () {
  const originDomain = [3.45, 11.5];
  const s = new LinearScale().domain(originDomain);

  expect(s.domain()).toEqual(originDomain);
  s.niceMax(5);
  expect(s.domain()).toEqual([originDomain[0], 12]);

  const newTicks = s.ticks(5);
  expect(newTicks).toEqual([4, 6, 8, 10, 12]);
  expect(s.domain()).toEqual([originDomain[0], newTicks[newTicks.length - 1]]);
});

test('linear.ticks(count) will filter ticks when niceMax is true', function () {
  const originDomain = [0, 45];
  const s = new LinearScale().domain(originDomain);

  expect(s.domain()).toEqual(originDomain);
  s.niceMax();
  expect(s.domain()).toEqual([originDomain[0], 45]);

  const newTicks = s.ticks(5);
  expect(newTicks).toEqual([0, 10, 20, 30, 40, 50]);
  expect(s.domain()).toEqual([originDomain[0], newTicks[newTicks.length - 1]]);
});

test('linear.customTicks with wilkinson', async () => {
  const s = new LinearScale().domain([0, 100]).range([500, 1000]);
  expect(
    s.ticks(5, {
      customTicks: (scale, count) => {
        const d = scale.calculateVisibleDomain(scale.get('_range'));
        return wilkinsonExtended(d[0], d[1], count);
      }
    })
  ).toStrictEqual([0, 25, 50, 75, 100]);
});

test('linear.customTicks with wilkinson in interval option', async () => {
  const s = new LinearScale().domain([0, 100]).range([500, 1000]);
  expect(
    s.ticks(10, {
      customTicks: (scale, count) => {
        const d = scale.calculateVisibleDomain(scale.get('_range'));
        return wilkinsonExtended(d[0], d[1], count);
      }
    })
  ).toStrictEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
});

test('linear.clone should not drop nice options', async () => {
  const s = new LinearScale().domain([0, 58]).range([0, 531]).nice(5);
  const s1 = s.clone();
  expect(s1.domain()).toStrictEqual(s.domain());
  expect(s1.range()).toStrictEqual(s.range());
});
