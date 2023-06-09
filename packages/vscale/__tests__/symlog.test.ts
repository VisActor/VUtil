import { SymlogScale } from '../src/symlog-scale';

it('new SymlogScale() has the expected defaults', () => {
  const s = new SymlogScale();
  expect(s.domain()).toEqual([0, 1]);
  expect(s.range()).toEqual([0, 1]);
  expect(s.clamp()).toBeFalsy();
  expect(s.constant()).toBe(1);
});

it('symlog(x) maps a domain value x to a range value y', () => {
  const s = new SymlogScale().domain([-100, 100]);
  expect(s.scale(-100)).toBe(0);
  expect(s.scale(100)).toBe(1);
  expect(s.scale(0)).toBe(0.5);
});

it('symlog.invert(y) maps a range value y to a domain value x', () => {
  const s = new SymlogScale().domain([-100, 100]);
  expect(s.invert(1)).toBeCloseTo(100);
});

it('symlog.invert(y) coerces range values to numbers', () => {
  const s = new SymlogScale().range(['-3', '3']);
  expect(s.invert(3)).toBe(1);
});

it('symlog.invert(y) returns NaN if the range is not coercible to number', () => {
  expect(isNaN(new SymlogScale().range(['#000', '#fff']).invert('#999'))).toBeTruthy();
  expect(isNaN(new SymlogScale().range([0, '#fff']).invert('#999'))).toBeTruthy();
});

it('symlog.constant(constant) sets the constant to the specified value', () => {
  const s = new SymlogScale().constant(5);
  expect(s.constant()).toBe(5);
});

it('symlog.constant(constant) changing the constant does not change the domain or range', () => {
  const s = new SymlogScale().constant(2);
  expect(s.domain()).toEqual([0, 1]);
  expect(s.range()).toEqual([0, 1]);
});

it('symlog.domain(domain) accepts an array of numbers', () => {
  expect(new SymlogScale().domain([]).domain()).toEqual([]);
  expect(new SymlogScale().domain([1, 0]).domain()).toEqual([1, 0]);
  expect(new SymlogScale().domain([1, 2, 3]).domain()).toEqual([1, 2, 3]);
});

it('symlog.domain(domain) coerces domain values to numbers', () => {
  expect(new SymlogScale().domain([new Date(Date.UTC(1990, 0, 1)), new Date(Date.UTC(1991, 0, 1))]).domain()).toEqual([
    631152000000, 662688000000
  ]);
  expect(new SymlogScale().domain(['0.0', '1.0']).domain()).toEqual([0, 1]);
  expect(new SymlogScale().domain([0, 1]).domain()).toEqual([0, 1]);
});

it('symlog.domain(domain) makes a copy of domain values', () => {
  const d = [1, 2];
  const s = new SymlogScale().domain(d);
  expect(s.domain()).toEqual([1, 2]);
  d.push(3);
  expect(s.domain()).toEqual([1, 2]);
  expect(d).toEqual([1, 2, 3]);
});

it('symlog.domain() returns a copy of domain values', () => {
  const s = new SymlogScale();
  const d = s.domain();
  expect(d).toEqual([0, 1]);
  d.push(3);
  expect(s.domain()).toEqual([0, 1]);
});

it('symlog.range(range) makes a copy of range values', () => {
  const r = [1, 2];
  const s = new SymlogScale().range(r);
  expect(s.range()).toEqual([1, 2]);
  r.push(3);
  expect(s.range()).toEqual([1, 2]);
  expect(r).toEqual([1, 2, 3]);
});

it('symlog.range() returns a copy of range values', () => {
  const s = new SymlogScale();
  const r = s.range();
  expect(r).toEqual([0, 1]);
  r.push(3);
  expect(s.range()).toEqual([0, 1]);
});

it('symlog.clamp() is false by default', () => {
  expect(new SymlogScale().clamp()).toBeFalsy();
  expect(new SymlogScale().range([10, 20]).scale(3)).toBe(30);
  expect(new SymlogScale().range([10, 20]).scale(-1)).toBe(0);
  expect(new SymlogScale().range([10, 20]).invert(30)).toBe(3);
  expect(new SymlogScale().range([10, 20]).invert(0)).toBe(-1);
});

it('symlog.clamp(true) restricts output values to the range', () => {
  expect(new SymlogScale().clamp(true).range([10, 20]).scale(2)).toBe(20);
  expect(new SymlogScale().clamp(true).range([10, 20]).scale(-1)).toBe(10);
});

it('symlog.clamp(true) restricts input values to the domain', () => {
  expect(new SymlogScale().clamp(true).range([10, 20]).invert(30)).toBe(1);
  expect(new SymlogScale().clamp(true).range([10, 20]).invert(0)).toBe(0);
});

it('symlog.clamp(clamp) coerces the specified clamp value to a boolean', () => {
  expect((new SymlogScale() as any).clamp('true').clamp()).toBeTruthy();
  expect((new SymlogScale() as any).clamp(1).clamp()).toBeTruthy();
  expect((new SymlogScale() as any).clamp('').clamp()).toBeFalsy();
  expect((new SymlogScale() as any).clamp(0).clamp()).toBeFalsy();
});

it('symlog.clone() returns a copy with changes to the domain are isolated', () => {
  const x = new SymlogScale();
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
  const y2 = x.domain([1, 1.9]).clone();
  x.nice(5);
  expect(x.domain()).toEqual([1, 2]);
  expect(y2.domain()).toEqual([1, 1.9]);
});

it('symlog.clone() returns a copy with changes to the range are isolated', () => {
  const x = new SymlogScale();
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

it('symlog.clone() returns a copy with changes to clamping are isolated', () => {
  const x = new SymlogScale().clamp(true);
  const y = x.clone();
  x.clamp(false);
  expect(x.scale(3)).toBe(2);
  expect(y.scale(2)).toBe(1);
  expect(y.clamp()).toBeTruthy();
  y.clamp(false);
  expect(x.scale(3)).toBe(2);
  expect(y.scale(3)).toBe(2);
  expect(x.clamp()).toBeFalsy();
});

it('symlog().clamp(true).invert(x) cannot return a value outside the domain', () => {
  const x = new SymlogScale().domain([1, 20]).clamp(true);
  expect(x.invert(0)).toBe(1);
  expect(x.invert(1)).toBe(20);
});
