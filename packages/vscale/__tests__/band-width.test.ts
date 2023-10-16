import { BandScale } from '../src/band-scale';

test('scaleBand() should return right bandwidth', function () {
  const s = new BandScale().domain(['A', 'B', 'C', 'D']).range([0, 200]);

  expect(s.bandwidth()).toBeCloseTo(50);

  s.rangeFactor([0, 1]);

  expect(s.bandwidth()).toBeCloseTo(50);
});

test('scaleBand() should return right bandwidth when set max bandwidth', function () {
  const s = new BandScale().domain(['A', 'B', 'C', 'D']).range([0, 200]).maxBandwidth(40).rangeFactor([0, 1]);

  expect(s.bandwidth()).toBeCloseTo(40);
  expect(s.maxBandwidth()).toBeCloseTo(40);

  s.rangeFactor([0, 1]);

  expect(s.bandwidth()).toBeCloseTo(40);
});

test('scaleBand() should return right bandwidth when set min bandwidth', function () {
  const s = new BandScale().domain(['A', 'B', 'C', 'D']).range([0, 200]).minBandwidth(40);

  expect(s.bandwidth()).toBeCloseTo(50);

  s.rangeFactor([0, 1]);
  s.calculateWholeRangeSize();

  expect(s.bandwidth()).toBeCloseTo(50);
});
