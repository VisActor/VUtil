import type {
  CreateImageFunction,
  GeometricMaskShape,
  ICreateCanvas,
  SegmentationOutputType as SegmentationOutputTypeBase,
  TextShapeMask
} from '../interface/wordcloud';
import type { TagItemAttribute } from '../wordcloud/interface';
import type { FieldOption } from '../wordcloud/wordcloud';

export type TagItemFunction<T> = (d?: any) => T;

export type Bounds = [{ x: number; y: number }, { x: number; y: number }];
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export type CallbackOption = (datum: any) => any;
export type AsType = {
  x: string;
  y: string;
  fontFamily: string;
  fontSize: string;
  fontStyle: string;
  fontWeight: string;
  angle: string;
  opacity: string;
  visible: string;
  isFillingWord: string;
  color: string;
};

export interface SegmentationOutputType extends SegmentationOutputTypeBase {
  fillingInitialFontSize?: number;
  fillingDeltaFontSize?: number;
}

export type wordsConfigType = {
  getText: TagItemFunction<string>;
  getFontSize?: TagItemFunction<number>;
  fontSizeRange?: [number, number];

  colorMode: 'linear' | 'ordinal';
  getColor: TagItemFunction<string>;
  getFillingColor?: TagItemFunction<string>;
  colorList?: string[];
  getColorHex?: TagItemFunction<string>;

  getFontFamily: TagItemFunction<string>;
  rotateList: number[];
  getPadding: TagItemFunction<number>;
  getFontStyle: TagItemFunction<string>;
  getFontWeight: TagItemFunction<string>;
  getFontOpacity: TagItemFunction<number>;

  fontSizeScale?: TagItemFunction<number>;
  colorScale?: TagItemFunction<string>;
  fillingColorScale?: TagItemFunction<string>;
};
export type LayoutConfigType = {
  size: [number, number];
  ratio: number;

  shapeUrl: string | TextShapeMask | GeometricMaskShape;
  random: boolean;
  textLayoutTimes: number;
  removeWhiteBorder: boolean;
  layoutMode: 'default' | 'ensureMapping' | 'ensureMappingEnlarge';
  fontSizeShrinkFactor: number;
  stepFactor: number;
  importantWordCount: number;
  globalShinkLimit: number;
  fontSizeEnlargeFactor: number;

  fillingRatio: number;
  fillingTimes: number;
  fillingXStep: number;
  fillingYStep: number;
  fillingInitialFontSize?: number;
  fillingDeltaFontSize?: number;
  fillingInitialOpacity: number;
  fillingDeltaOpacity: number;

  getFillingFontFamily: TagItemFunction<string>;
  getFillingFontStyle: TagItemFunction<string>;
  getFillingFontWeight: TagItemFunction<string>;
  getFillingPadding: TagItemFunction<number>;
  fillingRotateList: number[];
  fillingDeltaFontSizeFactor: number;

  // fill color 相关
  fillingColorList: string[];

  // 经过计算，补充的内容
  sameColorList: boolean;
  board?: number[];

  minInitFontSize: number;
  minFontSize: number;
  minFillFontSize: number;
};
export type CloudWordType = {
  x: number;
  y: number;
  weight: number;
  text: string;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  rotate: number;
  fontSize: number;
  opacity: number;
  padding: number;
  color: string;
  fillingColor: string;
  datum: any;
  visible: boolean;
  hasPlaced: boolean;

  wordSize?: [number, number];
  bounds?: any;
  hasText?: boolean;
  sprite?: number[];
  LT?: [number, number]; // 左上角点
};

export interface WordCloudShapeOptions {
  // data index key
  dataIndexKey?: string;

  // font value 相关
  text: FieldOption | TagItemAttribute<string> | string;

  // font style 相关
  size?: [number, number];
  fontFamily?: FieldOption | TagItemAttribute<string> | string;
  fontStyle?: FieldOption | TagItemAttribute<string> | string;
  fontOpacity?: FieldOption | TagItemAttribute<number> | number;
  fontWeight?: FieldOption | TagItemAttribute<string> | string;
  fontSize?: FieldOption | TagItemAttribute<number> | number;
  fontSizeRange?: [number, number];
  padding?: FieldOption | TagItemAttribute<number> | number;

  // font color 相关
  colorMode?: 'linear' | 'ordinal';
  colorField?: FieldOption;
  colorHexField?: FieldOption;
  colorList?: string[];

  // font rotate 相关
  rotate?: FieldOption | TagItemAttribute<number> | number;
  rotateList?: number[];

  // layout 相关
  shape: string | TextShapeMask | GeometricMaskShape;
  random?: boolean;
  textLayoutTimes?: number;
  layoutMode?: 'default' | 'ensureMapping' | 'ensureMappingEnlarge';
  ratio?: number;
  removeWhiteBorder?: boolean;
  fontSizeShrinkFactor?: number;
  stepFactor?: number;
  importantWordCount?: number;
  globalShinkLimit?: number;
  fontSizeEnlargeFactor?: number;

  // fill 相关
  fillingRatio?: number;
  fillingTimes?: number;
  fillingXRatioStep?: number;
  fillingYRatioStep?: number;
  fillingXStep?: number;
  fillingYStep?: number;
  fillingInitialFontSize?: number;
  fillingDeltaFontSize?: number;
  fillingInitialOpacity?: number;
  fillingDeltaOpacity?: number;

  // fill font style 相关
  fillingFontFamily?: FieldOption | TagItemAttribute<string> | string;
  fillingFontStyle?: FieldOption | TagItemAttribute<string> | string;
  fillingFontWeight?: FieldOption | TagItemAttribute<string> | string;
  fillingPadding?: FieldOption | TagItemAttribute<number> | number;
  fillingDeltaFontSizeFactor?: number;

  // fill color 相关
  fillingColorList?: string[];
  fillingColorField?: FieldOption;

  // fill rotate 相关
  fillingRotateList?: number[];

  as?: AsType;

  // 核心词最小初始布局字号
  minInitFontSize?: number;
  // 核心词最小布局字号
  minFontSize?: number;
  // 填充词词最小布局字号
  minFillFontSize?: number;

  onUpdateMaskCanvas?: (canvas?: HTMLCanvasElement) => void;
  onBeforeLayout?: () => void;
  onLayoutFinished?: (params: { successedWords: string[]; failedWords: string[] }) => void;
  createCanvas: ICreateCanvas;
  createImage: CreateImageFunction;
}
