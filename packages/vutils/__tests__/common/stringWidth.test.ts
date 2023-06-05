import { stringWidth } from '../../src';

describe('string width', () => {
  it('char width 1', () => {
    expect(stringWidth('测试1')).toEqual(5);
  });

  it('char width 2', () => {
    expect(stringWidth('の')).toEqual(2);
  });
});
