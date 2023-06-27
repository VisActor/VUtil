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
  expect(s.domain()[0] / 100000000).toBe(631123200000 / 100000000);
  expect(s.scale(new Date(1989, 9, 20))).toBeCloseTo(-0.205987, 5);
  expect(s.scale(new Date(1990, 0, 1))).toBeCloseTo(0.0, 5);
  expect(s.scale(new Date(1990, 2, 15))).toBeCloseTo(0.2039385, 5);
  expect(s.scale(new Date(1990, 4, 27))).toBeCloseTo(0.4057544, 5);
  expect(s.scale(new Date(1991, 0, 1))).toBeCloseTo(1, 5);
  s.domain(['1', '10']);
  expect(s.domain()).toEqual([1, 10]);
  expect(s.scale(5)).toBeCloseTo(0.69897, 5);
});

it('log.domain(…) can take negative values', () => {
  const x = new LogScale().domain([-100, -1]);
  expect(x.ticks()).toEqual([-100, -90, -80, -70, -60, -50, -40, -30, -20, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1]);
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
  expect(new LogScale().domain([0.15, 0.68]).ticks()).toEqual([0.2, 0.3, 0.4, 0.5, 0.6]);
  expect(new LogScale().domain([0.68, 0.15]).ticks()).toEqual([0.6, 0.5, 0.4, 0.3, 0.2]);
  expect(new LogScale().domain([-0.15, -0.68]).ticks()).toEqual([-0.2, -0.3, -0.4, -0.5, -0.6]);
  expect(new LogScale().domain([-0.68, -0.15]).ticks()).toEqual([-0.6, -0.5, -0.4, -0.3, -0.2]);
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
  expect(x.scale(2.5)).toBeCloseTo(1.3219281, 5);
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
  expect(x.invert('1')).toBeCloseTo(3.1622777, 5);
  x.range([new Date(1990, 0, 1), new Date(1991, 0, 1)]);
  expect(x.invert(new Date(1990, 6, 2, 13))).toBeCloseTo(3.1622777, 5);
  x.range(['#000', '#fff']);
  expect(Number.isNaN((x as any).invert('#999'))).toBeTruthy();
});

it('log.base(b) sets the log base, changing the ticks', () => {
  const x = new LogScale().domain([1, 32]);

  expect(x.base(2).ticks().map(x.tickFormat())).toEqual([1, 2, 4, 8, 16, 32]);
});

it('log.nice() nices the domain, extending it to powers of ten', () => {
  const x = new LogScale().domain([1.1, 10.9]).nice();
  expect(x.domain()).toEqual([1, 100]);
  x.domain([10.9, 1.1]).nice();
  expect(x.domain()).toEqual([100, 1]);
  x.domain([0.7, 11.001]).nice();
  expect(x.domain()).toEqual([0.1, 100]);
  x.domain([123.1, 6.7]).nice();
  expect(x.domain()).toEqual([1000, 1]);
  x.domain([0.01, 0.49]).nice();
  expect(x.domain()).toEqual([0.01, 1]);
  x.domain([1.5, 50]).nice();
  expect(x.domain()).toEqual([1, 100]);
  expect(x.scale(1)).toBe(0);
  expect(x.scale(100)).toBe(1);
});

it('log.nice() works on degenerate domains', () => {
  const x = new LogScale().domain([0, 0]).nice();
  expect(x.domain()).toEqual([0, 0]);
  x.domain([0.5, 0.5]).nice();
  expect(x.domain()).toEqual([0.1, 1]);
});

it('log.nice() on a polylog domain only affects the extent', () => {
  const x = new LogScale().domain([1.1, 1.5, 10.9]).nice();
  expect(x.domain()).toEqual([1, 1.5, 100]);
  x.domain([-123.1, -1.5, -0.5]).nice();
  expect(x.domain()).toEqual([-1000, -1.5, -0.1]);
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
  expect(y.domain()).toEqual([1, 100]);
  expect(y.scale(1)).toBeCloseTo(0);
  expect(y.scale(100)).toBeCloseTo(1);
  expect(y.invert(0)).toBeCloseTo(1);
  expect(y.invert(1)).toBeCloseTo(100);
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
  expect(s.domain([1e-1, 1e1]).ticks().map(round)).toEqual([
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  ]);
  expect(s.domain([1e-1, 1]).ticks().map(round)).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
  expect(s.domain([-1, -1e-1]).ticks().map(round)).toEqual([-1, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1]);
});

it('log.ticks() generates the expected power-of-ten ticks for descending domains', () => {
  const s = new LogScale();
  expect(s.domain([-1e-1, -1e1]).ticks().map(round)).toEqual(
    [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1].reverse()
  );
  expect(s.domain([-1e-1, -1]).ticks().map(round)).toEqual(
    [-1, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1].reverse()
  );
  expect(s.domain([1, 1e-1]).ticks().map(round)).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].reverse());
});

it('log.ticks() generates the expected power-of-ten ticks for small domains', () => {
  const s = new LogScale();
  expect(s.domain([1, 5]).ticks()).toEqual([1, 2, 3, 4, 5]);
  expect(s.domain([5, 1]).ticks()).toEqual([5, 4, 3, 2, 1]);
  expect(s.domain([-1, -5]).ticks()).toEqual([-1, -2, -3, -4, -5]);
  expect(s.domain([-5, -1]).ticks()).toEqual([-5, -4, -3, -2, -1]);
  expect(s.domain([286.9252014, 329.4978332]).ticks(1)).toEqual([300]);
  expect(s.domain([286.9252014, 329.4978332]).ticks(2)).toEqual([300]);
  expect(s.domain([286.9252014, 329.4978332]).ticks(3)).toEqual([300, 320]);
  expect(s.domain([286.9252014, 329.4978332]).ticks(4)).toEqual([290, 300, 310, 320]);
  expect(s.domain([286.9252014, 329.4978332]).ticks()).toEqual([290, 295, 300, 305, 310, 315, 320, 325]);
});

it('log.ticks() generates linear ticks when the domain extent is small', () => {
  const s = new LogScale();
  expect(s.domain([41, 42]).ticks()).toEqual([41, 41.1, 41.2, 41.3, 41.4, 41.5, 41.6, 41.7, 41.8, 41.9, 42]);
  expect(s.domain([42, 41]).ticks()).toEqual([42, 41.9, 41.8, 41.7, 41.6, 41.5, 41.4, 41.3, 41.2, 41.1, 41]);
  expect(s.domain([1600, 1400]).ticks()).toEqual([1600, 1580, 1560, 1540, 1520, 1500, 1480, 1460, 1440, 1420, 1400]);
});

it('log.base(base).ticks() generates the expected power-of-base ticks', () => {
  const s = new LogScale().base(Math.E);
  expect(s.domain([0.1, 100]).ticks().map(round)).toEqual([
    0.135335283237, 0.367879441171, 1, 2.718281828459, 7.389056098931, 20.085536923188, 54.598150033144
  ]);
});

it('log.ticks() returns the empty array when the domain is degenerate', () => {
  const x = new LogScale();
  expect(x.domain([0, 1]).ticks()).toEqual([]);
  expect(x.domain([1, 0]).ticks()).toEqual([]);
  expect(x.domain([0, -1]).ticks()).toEqual([]);
  expect(x.domain([-1, 0]).ticks()).toEqual([]);
  expect(x.domain([-1, 1]).ticks()).toEqual([]);
  expect(x.domain([0, 0]).ticks()).toEqual([]);
});

function round(x: number) {
  return Math.round(x * 1e12) / 1e12;
}
