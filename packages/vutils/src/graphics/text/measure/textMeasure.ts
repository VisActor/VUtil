import { isArray, isNil, isString, isValid } from '../../../common';
import type { Maybe } from '../../../type';
import { eastAsianCharacterInfo } from '../stringWidth';
import type { ITextMeasureOption, ITextMeasureSpec, ITextSize, TextMeasureInput, TextMeasureMethod } from './interface';
import { getContextFont } from './util';

export class TextMeasure<T extends Partial<ITextMeasureSpec>> {
  /** 英文字母集 */
  static readonly ALPHABET_CHAR_SET = 'abcdefghijklmnopqrstuvwxyz';

  /** 数字集 */
  static readonly NUMBERS_CHAR_SET = '0123456789';

  /** 全角字符 */
  static readonly FULL_SIZE_CHAR = '字';

  /** 数字大小缓存 */
  _numberCharSize: Maybe<ITextSize> = null;

  /** 全角字符大小缓存 */
  _fullCharSize: Maybe<ITextSize> = null;

  /** 字母大小缓存 */
  _letterCharSize: Maybe<ITextSize> = null;

  /** 特殊字符缓存 */
  _specialCharSizeMap: Record<string, ITextSize> = {};

  /** 内置测量 canvas */
  protected _canvas: Maybe<HTMLCanvasElement> = null;
  protected _context: Maybe<CanvasRenderingContext2D> = null;
  protected _contextSaved: boolean = false;

  /** 是否不支持 canvas */
  protected _notSupportCanvas: boolean = false;
  /** 是否不支持 vrender */
  protected _notSupportVRender: boolean = false;

  /** 文字 spec */
  protected readonly _userSpec: Partial<T> = {};
  textSpec: ITextMeasureSpec;

  protected readonly _option: ITextMeasureOption;

  /** 标准测量方法 */
  protected readonly _standardMethod: (text: TextMeasureInput) => ITextSize;

  /** 特殊字符集 */
  specialCharSet: string = '-/: .,@%\'"~';

  constructor(option: ITextMeasureOption, textSpec?: Partial<T>) {
    this._option = option;
    this._userSpec = textSpec ?? {};
    this.textSpec = this._initSpec();
    if (isValid(option.specialCharSet)) {
      this.specialCharSet = option.specialCharSet;
    }
    this._standardMethod = isValid(option.getTextBounds)
      ? this.fullMeasure.bind(this)
      : this.measureWithNaiveCanvas.bind(this);
  }

  /** 初始化测量相关上下文 */
  initContext() {
    if (this._notSupportCanvas) {
      return false;
    }
    if (isNil(this._canvas)) {
      if (isValid(this._option.getCanvasForMeasure)) {
        this._canvas = this._option.getCanvasForMeasure();
      }
      if (
        isNil(this._canvas) &&
        typeof window !== 'undefined' &&
        typeof window.document !== 'undefined' &&
        globalThis &&
        isValid(globalThis.document)
      ) {
        // 默认创建方法
        this._canvas = globalThis.document.createElement('canvas');
      }
    }
    if (isNil(this._context) && isValid(this._canvas)) {
      const context = this._canvas.getContext('2d');
      if (isValid(context)) {
        context.save();
        context.font = getContextFont(this.textSpec);
        this._contextSaved = true;
        this._context = context;
      }
    }
    if (isNil(this._context)) {
      this._notSupportCanvas = true;
      return false;
    }
    return true;
  }

  protected _initSpec(): ITextMeasureSpec {
    const { defaultFontParams = {} } = this._option;
    const {
      fontStyle = defaultFontParams.fontStyle,
      fontVariant = defaultFontParams.fontVariant,
      fontWeight = defaultFontParams.fontWeight ?? 'normal',
      fontSize = defaultFontParams.fontSize ?? 12,
      fontFamily = defaultFontParams.fontFamily ?? 'sans-serif',
      align,
      textAlign = align ?? 'center',
      baseline,
      textBaseline = baseline ?? 'middle',
      ellipsis,
      limit
    } = this._userSpec;

    let { lineHeight = fontSize } = this._userSpec;
    if (isString(lineHeight) && lineHeight[lineHeight.length - 1] === '%') {
      const scale = Number.parseFloat(lineHeight.substring(0, lineHeight.length - 1)) / 100;
      lineHeight = fontSize * scale;
    }

    return {
      fontStyle,
      fontVariant,
      fontFamily,
      fontSize,
      fontWeight,
      textAlign,
      textBaseline,
      ellipsis,
      limit,
      lineHeight
    };
  }

  /** 计算文本宽高 */
  measure(text: TextMeasureInput, method?: TextMeasureMethod): ITextSize {
    switch (method) {
      case 'vrender':
      case 'canopus' as any:
        return this.fullMeasure(text);
      case 'canvas':
        return this.measureWithNaiveCanvas(text);
      case 'simple':
        return this.quickMeasureWithoutCanvas(text);
      case 'quick':
      default:
        return this.quickMeasure(text);
    }
  }

  /** 精确计算文本宽高 */
  fullMeasure(text: TextMeasureInput): ITextSize {
    if (isNil(text)) {
      return { width: 0, height: 0 };
    }
    if (isNil(this._option.getTextBounds) || !this._notSupportVRender) {
      return this.measureWithNaiveCanvas(text); // 降级
    }
    const { fontFamily, fontSize, fontWeight, textAlign, textBaseline, ellipsis, limit, lineHeight } = this.textSpec;
    let size: ITextSize;
    try {
      const bounds = this._option.getTextBounds({
        text,
        fontFamily,
        fontSize,
        fontWeight,
        textAlign,
        textBaseline,
        ellipsis: !!ellipsis,
        maxLineWidth: limit || Infinity,
        lineHeight
      });
      size = { width: bounds.width(), height: bounds.height() };
    } catch (e) {
      this._notSupportVRender = true;
      size = this.measureWithNaiveCanvas(text); // 降级
    }
    return size;
  }

  /** 通过原生 canvas 精确计算文本宽度，高度为估算 */
  measureWithNaiveCanvas(text: TextMeasureInput): ITextSize {
    return this._measureReduce(text, this._measureWithNaiveCanvas.bind(this));
  }
  protected _measureWithNaiveCanvas(text: string): ITextSize {
    if (!this.initContext()) {
      return this._quickMeasureWithoutCanvas(text); // 降级
    }
    const metrics = this._context!.measureText(text);
    const { fontSize, lineHeight } = this.textSpec;
    return { width: metrics.width, height: (lineHeight as number) ?? fontSize };
  }

  /** 快速估算文本宽高 */
  quickMeasure(text: TextMeasureInput): ITextSize {
    return this._measureReduce(text, this._quickMeasure.bind(this));
  }
  protected _quickMeasure(text: string): ITextSize {
    const totalSize: ITextSize = {
      width: 0,
      height: 0
    };

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      // 先判断是否特殊字符
      let size = this._measureSpecialChar(char);
      // 再判断是否数字
      if (isNil(size) && TextMeasure.NUMBERS_CHAR_SET.includes(char)) {
        size = this._measureNumberChar();
      }
      // 再判断全角字符
      if (isNil(size) && ['F', 'W'].includes(eastAsianCharacterInfo(char))) {
        size = this._measureFullSizeChar();
      }
      // 最后按半角字符处理
      if (isNil(size)) {
        size = this._measureLetterChar();
      }
      totalSize.width += size.width;
      totalSize.height = Math.max(totalSize.height, size.height);
    }
    return totalSize;
  }

  /** 不使用 canvas 来快速估算文本宽高 */
  quickMeasureWithoutCanvas(text: TextMeasureInput): ITextSize {
    return this._measureReduce(text, this._quickMeasureWithoutCanvas.bind(this));
  }
  protected _quickMeasureWithoutCanvas(text: string): ITextSize {
    const totalSize: ITextSize = {
      width: 0,
      height: 0
    };

    const { fontSize, lineHeight } = this.textSpec;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      // 判断全角字符
      const size = ['F', 'W'].includes(eastAsianCharacterInfo(char)) ? 1 : 0.53;
      totalSize.width += size * fontSize;
    }
    totalSize.height = (lineHeight as number) ?? fontSize;
    return totalSize;
  }

  protected _measureReduce(text: TextMeasureInput, processor: (str: string) => ITextSize): ITextSize {
    const { fontSize, lineHeight } = this.textSpec;
    const defaultResult = { width: 0, height: 0 };

    if (isNil(text)) {
      return defaultResult;
    } else if (isArray(text)) {
      const textArr = text.filter(isValid).map(s => s.toString());
      if (textArr.length === 0) {
        return defaultResult;
      } else if (textArr.length === 1) {
        return processor(textArr[0]);
      }
      return {
        width: textArr.reduce((maxWidth, cur) => Math.max(maxWidth, processor(cur).width), 0),
        height: textArr.length * (((lineHeight as number) ?? fontSize) + 1) + 1 // 经验值
      };
    }
    return processor(text.toString());
  }

  /** 测量一个数字 */
  protected _measureNumberChar(): ITextSize {
    if (isNil(this._numberCharSize)) {
      const numberBounds = this._standardMethod(TextMeasure.NUMBERS_CHAR_SET);
      this._numberCharSize = {
        width: numberBounds.width / TextMeasure.NUMBERS_CHAR_SET.length, // 宽度取均值
        height: numberBounds.height
      };
    }
    return this._numberCharSize;
  }

  /** 测量一个全角字符 */
  protected _measureFullSizeChar(): ITextSize {
    if (isNil(this._fullCharSize)) {
      this._fullCharSize = this._standardMethod(TextMeasure.FULL_SIZE_CHAR);
    }
    return this._fullCharSize;
  }

  /** 测量一个英文字符 */
  protected _measureLetterChar(): ITextSize {
    if (isNil(this._letterCharSize)) {
      const alphabetBounds = this._standardMethod(TextMeasure.ALPHABET_CHAR_SET);
      this._letterCharSize = {
        width: alphabetBounds.width / TextMeasure.ALPHABET_CHAR_SET.length, // 宽度取均值
        height: alphabetBounds.height
      };
    }
    return this._letterCharSize;
  }

  /** 测量一个特殊字符 */
  protected _measureSpecialChar(char: string): Maybe<ITextSize> {
    if (isValid(this._specialCharSizeMap[char])) {
      return this._specialCharSizeMap[char];
    }
    if (this.specialCharSet.includes(char)) {
      this._specialCharSizeMap[char] = this._standardMethod(char);
      return this._specialCharSizeMap[char];
    }
    return null;
  }

  release() {
    if (isValid(this._canvas)) {
      this._canvas = null;
    }
    if (isValid(this._context)) {
      if (this._contextSaved) {
        this._context.restore();
        this._contextSaved = false;
      }
      this._context = null;
    }
  }
}
