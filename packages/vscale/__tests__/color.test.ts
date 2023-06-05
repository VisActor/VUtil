import { LinearScale } from '../src/linear-scale';

test('scaleLinear() has the expected defaults', function () {
  const s = new LinearScale();
  s.range(['red', 'green']);

  expect(s.domain()).toEqual([0, 1]);
  expect(s.range()).toEqual(['red', 'green']);
  expect(s.scale(0)).toEqual('rgb(255,0,0)');
  expect(s.scale(0.5)).toEqual('rgb(128,64,0)');
  expect(s.scale(1)).toEqual('rgb(0,128,0)');
});
