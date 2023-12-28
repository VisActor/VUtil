import { ColorUtil } from '@visactor/vutils';
import { interpolate } from '../src/utils/interpolate';
import { LogScale } from '../src/log-scale';
const { interpolateRgb } = ColorUtil;

test('LogScale() has the expected defaults', function () {
  const s = new LogScale();

  expect(s.domain()).toEqual([1, 10]);
  expect(s.range()).toEqual([0, 1]);
  expect(s.clamp()).toBeFalsy();
  expect(s.base()).toBe(10);
  expect(s.scale(5)).toBeCloseTo(0.69897, 5);
  expect(s.invert(0.69897)).toBeCloseTo(5, 2);
  expect(s.scale(3.162278)).toBeCloseTo(0.5, 2);
  expect(s.invert(0.5)).toBeCloseTo(3.162278, 5);
});

test('LogScale().domain(…) coerces values to numbers', () => {
  const s = new LogScale().domain([new Date(1990, 0, 1), new Date(1991, 0, 1)]);
  expect(s.domain()[0] / 10000000000).toBeCloseTo(631123200000 / 10000000000, 2);
  expect(s.scale(new Date(1989, 9, 20))).toBeCloseTo(-0.205987, 2);
  expect(s.scale(new Date(1990, 0, 1))).toBeCloseTo(0.0, 2);
  expect(s.scale(new Date(1990, 2, 15))).toBeCloseTo(0.2039385, 2);
  expect(s.scale(new Date(1990, 4, 27))).toBeCloseTo(0.4057544, 2);
  expect(s.scale(new Date(1991, 0, 1))).toBeCloseTo(1, 2);
  s.domain(['1', '10']);
  expect(s.domain()).toEqual([1, 10]);
  expect(s.scale(5)).toBeCloseTo(0.69897, 5);
});

it('log.domain(…) can take negative values', () => {
  const x = new LogScale().domain([-100, -1]);
  expect(x.ticks()).toEqual([-100, -90, -55, -33, -20, -12, -7, -4, -3, -2, -1]);
  expect(x.scale(-50)).toBeCloseTo(0.150515, 5);
});

it('log.domain(…).range(…) can take more than two values', () => {
  const x = new LogScale().domain([0.1, 1, 100]).range(['red', 'white', 'green']);
  expect(x.scale(0.5)).toEqual('rgb(255,178,178)');
  expect(x.scale(50)).toEqual('rgb(38,147,38)');
  expect(x.scale(75)).toEqual('rgb(16,136,16)');
});

it('log.domain(…) preserves specified domain exactly, with no floating point error', () => {
  const x = new LogScale().domain([0.1, 1000]);
  expect(x.domain()).toEqual([0.1, 1000]);
});

it('log.ticks(…) returns exact ticks, with no floating point error', () => {
  expect(new LogScale().domain([0.15, 0.68]).ticks()).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
  expect(new LogScale().domain([0.68, 0.15]).ticks()).toEqual([0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]);
  expect(new LogScale().domain([-0.15, -0.68]).ticks()).toEqual([-0.1, -0.2, -0.3, -0.4, -0.5, -0.7]);
  expect(new LogScale().domain([-0.68, -0.15]).ticks()).toEqual([-0.7, -0.5, -0.4, -0.3, -0.2, -0.1]);
});

it('log.range(…) does not coerce values to numbers', () => {
  const x = new LogScale().range(['0', '2']);
  expect(x.range()).toEqual(['0', '2']);
});

it('log.range(…) can take colors', () => {
  const x = new LogScale().range(['red', 'blue']);
  expect(x.scale(5)).toEqual('rgb(77,0,178)');
  x.range(['rgb(255,0,0)', '#0000ff']);
  expect(x.scale(5)).toEqual('rgb(77,0,178)');
  x.range(['#f00', '#00f']);
  expect(x.scale(5)).toEqual('rgb(77,0,178)');
  expect(x.scale(5)).toEqual('rgb(77,0,178)');
  // x.range(['hsl(0,100%,50%)', 'hsl(240,100%,50%)']);
  // expect(x.scale(5)).toEqual('rgb(77,0,178)');
});

it('log(x) does not clamp by default', () => {
  const x = new LogScale();
  expect(x.clamp()).toBeFalsy();
  expect(x.scale(0.5)).toBeCloseTo(-0.3010299, 5);
  expect(x.scale(15)).toBeCloseTo(1.1760913, 5);
});

it('log.clamp(true)(x) clamps to the domain', () => {
  const x = new LogScale().clamp(true);

  expect(x.scale(-1)).toBeCloseTo(0, 5);

  expect(x.scale(5)).toBeCloseTo(0.69897, 5);
  expect(x.scale(15)).toBeCloseTo(1, 5);
  x.domain([10, 1]);
  expect(x.scale(-1)).toBeCloseTo(1, 5);
  expect(x.scale(5)).toBeCloseTo(0.30103, 5);
  expect(x.scale(15)).toBeCloseTo(0, 5);
});

it('log.clamp(true).invert(y) clamps to the range', () => {
  const x = new LogScale().clamp(true);

  expect(x.invert(-0.1)).toBeCloseTo(1, 5);
  expect(x.invert(0.69897)).toBeCloseTo(5);
  expect(x.invert(1.5)).toBeCloseTo(10, 5);
  x.domain([10, 1]);
  expect(x.invert(-0.1)).toBeCloseTo(10, 5);
  expect(x.invert(0.30103)).toBeCloseTo(5, 5);
  expect(x.invert(1.5)).toBeCloseTo(1, 5);
});

it('log(x) maps a number x to a number y', () => {
  const x = new LogScale().domain([1, 2]);
  expect(x.scale(0.5)).toBeCloseTo(-1.0, 5);
  expect(x.scale(1.0)).toBeCloseTo(0.0, 5);
  expect(x.scale(1.5)).toBeCloseTo(0.5849625, 5);
  expect(x.scale(2.0)).toBeCloseTo(1.0, 5);
  expect(x.scale(2.5)).toBeCloseTo(1.3219281, 2);
});

it('log.invert(y) maps a number y to a number x', () => {
  const x = new LogScale().domain([1, 2]);
  expect(x.invert(-1.0)).toBeCloseTo(0.5, 5);
  expect(x.invert(0.0)).toBeCloseTo(1.0, 5);
  expect(x.invert(0.5849625)).toBeCloseTo(1.5, 5);
  expect(x.invert(1.0)).toBeCloseTo(2.0, 5);
  expect(x.invert(1.3219281)).toBeCloseTo(2.5, 5);
});

it('log.invert(y) coerces y to number', () => {
  const x = new LogScale().range(['0', '2']);
  expect(x.invert('1')).toBeCloseTo(3.1622777, 2);
  x.range([new Date(1990, 0, 1), new Date(1991, 0, 1)]);
  expect(x.invert(new Date(1990, 6, 2, 13))).toBeCloseTo(3.1622777, 2);
  x.range(['#000', '#fff']);
  expect(Number.isNaN((x as any).invert('#999'))).toBeTruthy();
});

it('log.base(b) sets the log base, changing the ticks', () => {
  const x = new LogScale().domain([1, 32]);

  expect(x.base(2).ticks().map(x.tickFormat())).toEqual([1, 2, 3, 4, 6, 8, 11, 16, 23, 32]);
});

it('log.nice() nices the domain, extending it to powers of ten', () => {
  const x = new LogScale().domain([1.1, 10.9]).nice();
  expect(x.domain()).toEqual([1, 11]);
  x.domain([10.9, 1.1]).nice();
  expect(x.domain()).toEqual([11, 1]);
  x.domain([0.7, 11.001]).nice();
  expect(x.domain()).toEqual([0.1, 12]);
  x.domain([123.1, 6.7]).nice();
  expect(x.domain()).toEqual([124, 1]);
  x.domain([0.01, 0.49]).nice();
  expect(x.domain()).toEqual([0.01, 1]);
  x.domain([1.5, 50]).nice();
  expect(x.domain()).toEqual([1, 50]);
  expect(x.scale(1)).toBe(0);
  expect(x.scale(100)).toBe(1.177183820135558);
});

it('log.nice() works on degenerate domains', () => {
  const x = new LogScale().domain([0, 0]).nice();
  expect(x.domain()).toEqual([1e-16, 1e-15]);
  x.domain([0.5, 0.5]).nice();
  expect(x.domain()).toEqual([0.1, 1]);
});

it('log.nice() on a polylog domain only affects the extent', () => {
  const x = new LogScale().domain([1.1, 1.5, 10.9]).nice();
  expect(x.domain()).toEqual([1, 1.5, 11]);
  x.domain([-124, -1.5, -0]).nice();
  expect(x.domain()).toEqual([-1000, -1.5, -1e-16]);
});

it('log.nice() works on large domains with large or small base', () => {
  const x = new LogScale().base(1024).domain([1785, 11041]).nice();
  expect(x.d3Ticks()).toEqual([1024, 2048, 3072, 4096, 5120, 6144, 7168, 8192, 9216, 10240]);
  x.base(2).domain([1785, 11041]).nice();
  expect(x.d3Ticks()).toEqual([2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000]);
  x.base(Math.E).domain([1785, 11041]).nice();
  expect(x.d3Ticks()).toEqual([403.4287934927351, 2980.9579870417283, 22026.465794806718]);
  x.base(10).domain([1785, 11041]).nice();
  expect(x.d3Ticks()).toEqual([1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]);
});

it('log.nice() works on small domains with large or small base', () => {
  const x = new LogScale().base(1024).domain([1, 5]).nice();
  expect(x.d3Ticks()).toEqual([1, 2, 3, 4, 5]);
  x.base(2).domain([1, 5]).nice();
  expect(x.d3Ticks()).toEqual([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]);
  x.base(Math.E).domain([1, 5]).nice();
  expect(x.d3Ticks()).toEqual([1, 2.718281828459045, 7.38905609893065]);
  x.base(10).domain([1, 5]).nice();
  expect(x.d3Ticks()).toEqual([1, 2, 3, 4, 5]);
});

it('log.clone() isolates changes to the domain', () => {
  const x = new LogScale();
  const y = x.clone();

  x.domain([10, 100]);
  expect(y.domain()).toEqual([1, 10]);
  expect(x.scale(10)).toBe(0);
  expect(y.scale(1)).toBe(0);
  y.domain([100, 1000]);
  expect(x.scale(100)).toBe(1);
  expect(y.scale(100)).toBe(0);
  expect(x.domain()).toEqual([10, 100]);
  expect(y.domain()).toEqual([100, 1000]);
});

it('log.clone() isolates changes to the domain via nice', () => {
  const x = new LogScale().domain([1.5, 50]);
  const y = x.clone().nice();
  expect(x.domain()).toEqual([1.5, 50]);
  expect(x.scale(1.5)).toBeCloseTo(0);
  expect(x.scale(50)).toBeCloseTo(1);
  expect(x.invert(0)).toBeCloseTo(1.5, 5);
  expect(x.invert(1)).toBeCloseTo(50, 5);
  expect(y.domain()).toEqual([1, 50]);
  expect(y.scale(1)).toBeCloseTo(0);
  expect(y.scale(100)).toBeCloseTo(1.177183820135558);
  expect(y.invert(0)).toBeCloseTo(1);
  expect(y.invert(1)).toBeCloseTo(49.99999999999999);
});

it('log.clone() isolates changes to the range', () => {
  const x = new LogScale();
  const y = x.clone();
  x.range([1, 2]);
  expect(x.invert(1)).toBeCloseTo(1);
  expect(y.invert(1)).toBeCloseTo(10);
  expect(y.range()).toEqual([0, 1]);
  y.range([2, 3]);
  expect(x.invert(2)).toBeCloseTo(10);
  expect(y.invert(2)).toBeCloseTo(1);
  expect(x.range()).toEqual([1, 2]);
  expect(y.range()).toEqual([2, 3]);
});

it('log.clone() isolates changes to the interpolator', () => {
  const x = new LogScale().range(['red', 'blue']);
  const y = x.clone();
  const interpolateString = (a: string, b: string) => {
    return interpolateRgb(ColorUtil.Color.parseColorString(a), ColorUtil.Color.parseColorString(b));
  };
  expect(x.scale(5)).toBe('rgb(77,0,178)');
  expect(y.scale(5)).toBe('rgb(77,0,178)');
  x.interpolate(interpolateString);
  expect(x.interpolate()).toBe(interpolateString);
  expect(y.interpolate()).toBe(interpolate);
});

it('log.clone() isolates changes to clamping', () => {
  const x = new LogScale().clamp(true);
  const y = x.clone();
  x.clamp(false);
  expect(x.scale(0.5)).toBeCloseTo(-0.30103);
  expect(y.scale(0.5)).toBeCloseTo(0);
  expect(y.clamp()).toBeTruthy();
  y.clamp(false);
  expect(x.scale(20)).toBeCloseTo(1.30103);
  expect(y.scale(20)).toBeCloseTo(1.30103);
  expect(x.clamp()).toBeFalsy();
});

it('log.ticks() generates the expected power-of-ten for ascending ticks', () => {
  const s = new LogScale();
  expect(s.domain([1e-1, 1e1]).ticks().map(round)).toEqual([0, 1, 2, 3, 4, 6, 10]);
  expect(s.domain([1e-1, 1]).ticks().map(round)).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1]);
  expect(s.domain([-1, -1e-1]).ticks().map(round)).toEqual([-1, -0.8, -0.7, -0.5, -0.4, -0.3, -0.2, -0.1]);
});

it('log.ticks() generates the expected power-of-ten ticks for descending domains', () => {
  const s = new LogScale();
  expect(s.domain([-1e-1, -1e1]).ticks().map(round)).toEqual([-10, -7, -4, -3, -2, -1, -0].reverse());
  expect(s.domain([-1e-1, -1]).ticks().map(round)).toEqual([-1, -0.8, -0.7, -0.5, -0.4, -0.3, -0.2, -0.1].reverse());
  expect(s.domain([1, 1e-1]).ticks().map(round)).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1].reverse());
});

it('log.ticks() generates the expected power-of-ten ticks for small domains', () => {
  const s = new LogScale();
  expect(s.domain([1, 5]).ticks()).toEqual([1, 2, 3, 4, 5]);
  expect(s.domain([5, 1]).ticks()).toEqual([5, 4, 3, 2, 1]);
  expect(s.domain([-1, -5]).ticks()).toEqual([-1, -2, -3, -4, -5]);
  expect(s.domain([-5, -1]).ticks()).toEqual([-5, -4, -3, -2, -1]);
  expect(s.domain([286.9252014, 329.4978332]).ticks(1)).toEqual([287, 316, 329]);
  expect(s.domain([286.9252014, 329.4978332]).ticks(2)).toEqual([287, 288, 302, 316, 329]);
  expect(s.domain([286.9252014, 329.4978332]).ticks(3)).toEqual([287, 288, 302, 316, 329]);
  expect(s.domain([286.9252014, 329.4978332]).ticks(4)).toEqual([287, 288, 302, 316, 329]);
  expect(s.domain([286.9252014, 329.4978332]).ticks()).toEqual([
    287, 288, 292, 295, 299, 302, 305, 309, 313, 316, 320, 324, 327, 329
  ]);
});

it('log.ticks() generates linear ticks when the domain extent is small', () => {
  const s = new LogScale();
  expect(s.domain([41, 42]).ticks()).toEqual([41, 42]);
  expect(s.domain([42, 41]).ticks()).toEqual([42, 41]);
  expect(s.domain([1600, 1400]).ticks()).toEqual([
    1600, 1585, 1567, 1549, 1531, 1514, 1496, 1479, 1462, 1445, 1429, 1413, 1400
  ]);
});

it('log.base(base).ticks() generates the expected power-of-base ticks', () => {
  const s = new LogScale().base(Math.E);
  expect(s.domain([0.1, 100]).ticks().map(round)).toEqual([0, 1, 5, 10, 50, 100]);
});

it('log.ticks() returns the empty array when the domain is degenerate', () => {
  const x = new LogScale();
  expect(x.domain([0, 1]).ticks()).toEqual([0, 1]);
  expect(x.domain([1, 0]).ticks()).toEqual([1, 0]);
  expect(x.domain([0, -1]).ticks()).toEqual([0]);
  expect(x.domain([-1, 0]).ticks()).toEqual([-1, -0]);
  // expect(x.domain([-1, 1]).ticks()).toEqual([0, -1]);
  // expect(x.domain([0, 0]).ticks()).toEqual([0]);
});

it('log.forceTicks() generates the expected power-of-ten for ascending ticks', () => {
  const s = new LogScale();
  expect(s.domain([1e-1, 1e1]).forceTicks().map(round)).toHaveLength(10);
  expect(s.domain([1e-1, 1]).forceTicks().map(round)).toHaveLength(10);
  expect(s.domain([-1, -1e-1]).forceTicks().map(round)).toHaveLength(10);
});

it('log.forceTicks() return right tick count for descending domains', () => {
  const s = new LogScale();
  expect(s.domain([-1e-1, -1e1]).forceTicks().map(round)).toHaveLength(10);
  expect(s.domain([-1e-1, -1]).forceTicks().map(round)).toHaveLength(10);
  expect(s.domain([1, 1e-1]).forceTicks().map(round)).toHaveLength(10);
});

it('log.forceTicks() return right tick count for small domains', () => {
  const s = new LogScale();
  expect(s.domain([1, 5]).forceTicks()).toHaveLength(10);
  expect(s.domain([5, 1]).forceTicks()).toHaveLength(10);
  expect(s.domain([-1, -5]).forceTicks()).toHaveLength(10);
  expect(s.domain([-5, -1]).forceTicks()).toHaveLength(10);
});

it('log.forceTicks() return right tick count when the domain extent is small', () => {
  const s = new LogScale();
  expect(s.domain([41, 42]).forceTicks()).toHaveLength(10);
  expect(s.domain([42, 41]).forceTicks()).toHaveLength(10);
  expect(s.domain([1600, 1400]).forceTicks()).toHaveLength(10);
});

it('log.forceTicks() return right tick count when the domain is degenerate', () => {
  const x = new LogScale();
  // expect(x.domain([0, 1]).forceTicks()).toHaveLength(10);
  // expect(x.domain([1, 0]).forceTicks()).toHaveLength(10);
  // expect(x.domain([0, -1]).forceTicks()).toHaveLength(1);
  // expect(x.domain([-1, 0]).forceTicks()).toHaveLength(0);
  // expect(x.domain([-1, 1]).forceTicks()).toHaveLength(0);
  // expect(x.domain([0, 0]).forceTicks()).toHaveLength(1);
});

// function round(x: number) {
//   return Math.round(x * 1e12) / 1e12;
// }

it('log.ticks(…) ', () => {
  // expect(new LogScale().domain([1, 1000]).ticks(4)).toEqual([1, 10, 100, 1000]);
  expect(new LogScale().domain([1, 16000]).base(Math.E).ticks(6)).toEqual([1, 10, 50, 500, 5000, 16000]);
  expect(new LogScale().domain([2, 2048]).base(2).ticks()).toEqual([2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]);
  expect(new LogScale().domain([0, 1]).ticks()).toEqual([0, 1]);
});

function round(x: number) {
  return Math.round(x * 1e12) / 1e12;
}

it('log scale dont throw error when domain contain 0', () => {
  const scale = new LogScale().domain([0, 1000]).range([0, 10000]);

  expect(scale.scale(100)).toBeCloseTo(9463.909295551413);
  expect(scale.scale(0)).toBeCloseTo(0);
  expect(scale.scale(1000)).toBeCloseTo(10000);
  expect(scale.ticks(5)).toEqual([0, 1, 1000]);
});

it('log scale dont throw error when domain contain 0 and negative value', () => {
  const scale = new LogScale().domain([-1000, 0]).range([0, 10000]);
  expect(scale.scale(-160)).toBeCloseTo(426.6638791545382);
  expect(scale.scale(0)).toBeCloseTo(10000);
  expect(scale.scale(-1000)).toBeCloseTo(0);
  expect(scale.ticks(5)).toEqual([-1000, -1, -0]);
});
