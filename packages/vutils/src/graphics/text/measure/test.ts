import { isNil } from '../../../common';
import type { ITextMeasureSpec, ITextSize, TextMeasureMethod } from './interface';
import { TextMeasure } from './textMeasure';

const getNumberChar = () => {
  return TestTextMeasure.NUMBERS_CHAR_SET[Math.floor(Math.random() * TestTextMeasure.NUMBERS_CHAR_SET.length)];
};
export const getTestNumbers = (length: number) => Array(length).fill(0).map(getNumberChar).join('');

const getLetterChar = () => {
  return TestTextMeasure.ALPHABET_CHAR_SET[Math.floor(Math.random() * TestTextMeasure.ALPHABET_CHAR_SET.length)];
};
export const getTestWord = (length: number) => Array(length).fill(0).map(getLetterChar).join('');

export class TestTextMeasure<T extends Partial<ITextMeasureSpec>> extends TextMeasure<T> {
  /** 测试方法 */
  test(methods?: TextMeasureMethod[], getStrCallback?: () => string, count?: number) {
    const sub = (numbers: number[]) => numbers.reduce((sum, cur) => sum + cur, 0);
    const mean = (numbers: number[]) => sub(numbers) / numbers.length;
    const variance = (numbers: number[]) => {
      const m = mean(numbers);
      return mean(numbers.map(num => Math.pow(num - m, 2)));
    };

    const callback =
      getStrCallback ?? (() => `测试${getTestWord(8)} ${getTestNumbers(4)}/${getTestNumbers(2)}-${getTestNumbers(2)}`);
    // 测试文本
    const textArr = Array(count ?? 100000)
      .fill(0)
      .map(callback);

    const methodMap: Record<string, (text: number | string) => ITextSize> = {
      canopus: this.fullMeasure.bind(this),
      canvas: this.measureWithNaiveCanvas.bind(this),
      simple: this.quickMeasureWithoutCanvas.bind(this),
      quick: this.quickMeasure.bind(this),
      old: (text: number | string) => {
        if (isNil(text)) {
          return { width: 0, height: 0 };
        }
        const str = text.toString();
        const { fontSize } = this.textSpec;
        return {
          width: fontSize * 0.8 * str.length,
          height: fontSize
        };
      }
    };
    const methodList = methods ?? Object.keys(methodMap);

    const report: Record<
      keyof typeof methodMap,
      {
        errMean?: ITextSize;
        errVar?: ITextSize;
        time: number;
      }
    > = {} as any;

    // 标准方法
    const timetmp = performance.now();
    const standardResult = textArr.map(this._standardMethod);
    const standardTime = performance.now() - timetmp;
    report.standard = {
      time: standardTime
    };

    // 测试方法
    methodList.forEach(method => {
      const testMethod = methodMap[method];
      if (testMethod) {
        const timetmp = performance.now();
        const testResult = textArr.map(testMethod as (text: number | string) => ITextSize);
        const testTime = performance.now() - timetmp;
        // 计算误差
        const errList = textArr.map(
          (_, i) =>
            ({
              width: testResult[i].width - standardResult[i].width,
              height: testResult[i].height - standardResult[i].height
            } as ITextSize)
        );
        report[method] = {
          errMean: {
            width: mean(errList.map(e => e.width)),
            height: mean(errList.map(e => e.height))
          },
          errVar: {
            width: variance(errList.map(e => e.width)),
            height: variance(errList.map(e => e.height))
          },
          time: testTime
        };
      }
    });

    return {
      report,
      textArr
    };
  }
}
