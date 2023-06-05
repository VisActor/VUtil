import { BandScale } from '../src/band-scale';
import { PointScale } from '../src/point-scale';

test('scalePoint() has the expected defaults', function () {
  const s = new PointScale();
  expect(s.domain()).toEqual([]);
  expect(s.range()).toEqual([0, 1]);
  expect(s.bandwidth()).toBe(0);
  expect(s.step()).toBe(1);
  expect(s.round()).toBe(false);
  expect(s.padding()).toBe(0);
  expect(s.align()).toBe(0.5);
});

test('scalePoint() does not expose paddingInner and paddingOuter', function () {
  const s = new PointScale();
  expect(s.paddingInner).toBe(undefined);
  expect(s.paddingOuter).toBe(undefined);
});

test('scalePoint() is similar to scaleBand().paddingInner(1)', function () {
  const p = new PointScale().domain(['foo', 'bar']).range([0, 960]);
  const b = new BandScale().domain(['foo', 'bar']).range([0, 960]).paddingInner(1);

  expect(p.domain().map(p.scale.bind(p))).toEqual(b.domain().map(b.scale.bind(b)));
  expect(p.bandwidth()).toBe(b.bandwidth());
  expect(p.step()).toBe(b.step());
});

test('point.padding(p) sets the band outer padding to p', function () {
  const p = new PointScale().domain(['foo', 'bar']).range([0, 960]).padding(0.5);
  const b = new BandScale().domain(['foo', 'bar']).range([0, 960]).paddingInner(1).paddingOuter(0.5);
  expect(p.domain().map(p.scale.bind(p))).toEqual(b.domain().map(b.scale.bind(b)));
  expect(p.bandwidth()).toBe(b.bandwidth());
  expect(p.step()).toBe(b.step());
});

test('point.copy() returns a copy', function () {
  const s = new PointScale();
  expect(s.domain()).toEqual([]);
  expect(s.range()).toEqual([0, 1]);
  expect(s.bandwidth()).toBe(0);
  expect(s.step()).toBe(1);
  expect(s.round()).toBe(false);
  expect(s.padding()).toBe(0);
  expect(s.align()).toBe(0.5);
});
