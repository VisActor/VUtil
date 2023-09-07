import type { TextMeasureMethod } from '../../src';
import { TextMeasure } from '../../src';
import { TestTextMeasure } from './util';

describe('downgrade', () => {
  it('test without vrender', () => {
    const str = 'test';
    const textMeasure = new TextMeasure({});
    const { width: width1 } = textMeasure.measureWithNaiveCanvas(str);
    const { width: width2 } = textMeasure.fullMeasure(str);
    expect(width2).toBe(width1);
  });
});

describe('downgrade 1', () => {
  it('test without vrender', () => {
    const textMeasureTest = new TestTextMeasure({});
    const testMethod = ['canvas', 'vrender'] as TextMeasureMethod[];
    const { report } = textMeasureTest.test(testMethod, undefined);
    const { canvas, vrender } = report;
    expect(canvas.errMean.height).toEqual(vrender.errMean.height);
  });
});
