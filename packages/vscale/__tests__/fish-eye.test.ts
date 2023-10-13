import { LinearScale } from '../src/linear-scale';
import { BandScale } from '../src/band-scale';

test('fishEye of band scale', function () {
  const s = new BandScale(true).domain(['A', 'B', 'C', 'D', 'E']).range([0, 100]);

  expect(s.scale('A')).toBeCloseTo(0);
  expect(s.scale('B')).toBeCloseTo(20);
  expect(s.scale('C')).toBeCloseTo(40);
  expect(s.scale('D')).toBeCloseTo(60);
  expect(s.scale('E')).toBeCloseTo(80);

  s.fishEye({ focus: 50, radius: 20 });
  expect(s.scale('A')).toBeCloseTo(0);
  expect(s.scale('B')).toBeCloseTo(20);
  expect(s.scale('C')).toBeCloseTo(36.53412132054993);
  expect(s.scale('D')).toBeCloseTo(63.46587867945007);
  expect(s.scale('E')).toBeCloseTo(80);
});

test('fishEye of linear scale', function () {
  const s = new LinearScale().domain([20, 60]).range([0, 100]);

  expect(s.scale(20)).toBeCloseTo(0);
  expect(s.scale(35)).toBeCloseTo(37.5);
  expect(s.scale(40)).toBeCloseTo(50);
  expect(s.scale(45)).toBeCloseTo(62.5);
  expect(s.scale(60)).toBeCloseTo(100);

  s.fishEye({ focus: 50, radius: 20 });

  expect(s.scale(20)).toBeCloseTo(0);
  expect(s.scale(35)).toBeCloseTo(34.4974531432733);
  expect(s.scale(40)).toBeCloseTo(50);
  expect(s.scale(45)).toBeCloseTo(65.5025468567267);
  expect(s.scale(60)).toBeCloseTo(100);

  s.fishEye(null, false, true);
  expect(s.scale(35)).toBeCloseTo(37.5);
  expect(s.scale(45)).toBeCloseTo(62.5);
});
