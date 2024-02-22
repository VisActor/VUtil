import { LinearScale } from '../src/linear-scale';

test('linear(x) will not ignores extra range values if the domain is smaller than the range', function () {
  const scale = new LinearScale();

  scale.clamp(true).domain([-10, 10]).range([100, 200]);
  expect(scale.scale(0)).toBe(150);
  expect(scale.scale(-50)).toBe(100);
  expect(scale.scale(50)).toBe(200);

  scale.domain([-100, 100]);
  expect(scale.scale(0)).toBe(150);
  expect(scale.scale(-50)).toBe(125);
  expect(scale.scale(50)).toBe(175);
});
