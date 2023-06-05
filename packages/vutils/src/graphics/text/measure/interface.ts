import type { IBounds } from '../../../data-structure';

/**
 * 文本估算方法
 * simple：完全不调用 canopus，快速文本大小估算，速度最快、最粗糙
 * canvas：调用原生 canvas 的文本大小估算，宽度较精准，高度为估算
 * canopus：调用 canopus 的文本大小估算，速度最慢、最精细
 * quick（默认）：部分调用 canopus 的文本大小估算，速度和精确度平衡
 */
export type TextMeasureMethod = 'simple' | 'quick' | 'canvas' | 'canopus';

export interface ITextSize {
  width: number;
  height: number;
}

// FIXME: from Canopus
export interface ITextFontParams {
  fontStyle: string;
  fontVariant: string;
  fontWeight: string | number;
  fontSize: number;
  fontFamily: string;
}

/** 文本测量需要用到的text spec */
export interface ITextMeasureSpec extends Partial<ITextFontParams> {
  fontSize: number;
  fontFamily: string;
  align?: string;
  textAlign: string;
  baseline?: string;
  textBaseline: string;
  ellipsis?: string | boolean;
  limit?: number;
  lineHeight?: number;
}

export interface ITextMeasureOption {
  /** 默认字体属性 */
  defaultFontParams?: Partial<ITextFontParams>;

  /** 特殊字符集 */
  specialCharSet?: string;

  /** 来自 canopus 的测量方法 */
  getTextBounds?: (params: any) => IBounds;

  /** 外部获取 canvas 的方法（小组件工作台移动端无法创建公共canvas，需要传入） */
  getCanvasForMeasure?: () => any;
}

export type TextMeasureInput = number | string | (number | string)[];
