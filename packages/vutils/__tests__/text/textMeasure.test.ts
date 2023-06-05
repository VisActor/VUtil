import { TextMeasure } from '../../src';

describe('downgrade', () => {
  it('test without canopus', () => {
    const str = 'test';
    const textMeasure = new TextMeasure({});
    const { width: width1 } = textMeasure.measureWithNaiveCanvas(str);
    const { width: width2 } = textMeasure.fullMeasure(str);
    expect(width2).toBe(width1);
  });
});
