import type { BaseScale } from './base-scale';
import type { ScaleEnum } from './type';

export type Tuple<TItem, TLength extends number> = [TItem, ...TItem[]] & { length: TLength };

export type InterpolateType<T> = (a: T, b: T) => (x: number) => T;

export type TransformType = (v: number) => number;

export type BimapType<T> = (
  domain: [number, number],
  range: [T, T],
  interpolate: InterpolateType<T>
) => (x: number) => T;

export type PolymapType<T> = (domain: number[], range: T[], interpolate: InterpolateType<T>) => (x: number) => T;

export interface FloorCeilType<T> {
  floor: (x: T) => T;
  ceil: (x: T) => T;
  offset?: (x: T, step: number) => T;
}

export type DateLikeType = number | string | Date;

export type TickData = {
  // data index
  index: number;
  // tick ratio of axis range
  value: number;
  // tick value
  tick: any;
};

export type DiscreteScaleType = `${ScaleEnum.Ordinal}` | `${ScaleEnum.Band}` | `${ScaleEnum.Point}`;
export type ContinuousScaleType =
  | `${ScaleEnum.Linear}`
  | `${ScaleEnum.Log}`
  | `${ScaleEnum.Pow}`
  | `${ScaleEnum.Sqrt}`
  | `${ScaleEnum.Symlog}`
  | `${ScaleEnum.Time}`;
export type DiscretizingScaleType = `${ScaleEnum.Quantile}` | `${ScaleEnum.Quantize}` | `${ScaleEnum.Threshold}`;
export type ScaleType = DiscreteScaleType | ContinuousScaleType | DiscretizingScaleType | `${ScaleEnum.Identity}`;

export interface IRangeFactor {
  calculateVisibleDomain: (range: any[]) => any;
  rangeFactor: (_?: [number, number], slience?: boolean, clear?: boolean) => this | any;
  rangeFactorStart: (_?: number, slience?: boolean) => this | any;
  rangeFactorEnd: (_?: number, slience?: boolean) => this | any;
  unknown: (_?: any) => this | any;
}

export interface IContinuesScaleTicks {
  ticks: (count?: number, options?: { noDecimals?: boolean }) => any[];
  d3Ticks: (count?: number, options?: { noDecimals?: boolean }) => any[];
  forceTicks: (count?: number) => any[];
  stepTicks: (step: number) => any[];
  nice: (count?: number) => this;
  niceMin: (count?: number) => this;
  niceMax: (count?: number) => this;
}

export interface IBaseScale {
  readonly type: string;
  unknown: (_?: any) => this | any;
  scale: (x: any) => any;
  domain: (_?: any[], slience?: boolean) => this | any;
  range: (_?: any[], slience?: boolean) => this | any;
  invert?: (y: any) => any;
  clone?: () => IBaseScale;
  rescale?: (slience?: boolean) => this;
  tickData?: (count?: number) => TickData[];
}

export interface IOrdinalScale extends IBaseScale {
  specified: (_?: Record<string, unknown>) => this | Record<string, unknown>;
  /**
   * 获取domain中值的序号, 历史原因序号从 1 开始
   * @param x 输入值
   * @returns 序号，如果不存在，返回 -1
   */
  index: (x: any) => number;
}

export interface IBandLikeScale extends IOrdinalScale, IRangeFactor {
  readonly type: DiscreteScaleType;
  domain: (_?: any[], slience?: boolean) => this | any;
  range: (_?: any[], slience?: boolean) => this | any;
  rescale: (slience?: boolean) => this;
  rangeRound: (_: any[], slience?: boolean) => this;
  ticks?: (count?: number) => any[];
  /**
   * 生成tick数组，这个tick数组的长度就是count的长度
   */
  forceTicks: (count: number) => any[];
  /**
   * 基于给定step的ticks数组生成
   */
  stepTicks: (step: number) => any[];
  padding: (p?: number | [number, number], slience?: boolean) => this | number;
  paddingInner: (_?: number, slience?: boolean) => any;
  paddingOuter: (_?: number, slience?: boolean) => any;
  bandwidth: (_?: number | 'auto', slience?: boolean) => number;
  maxBandwidth: (_?: number | 'auto', slience?: boolean) => number;
  minBandwidth: (_?: number | 'auto', slience?: boolean) => number;
  /** 当前 bandwidth 是否被固定 */
  isBandwidthFixed: () => boolean;
  step: () => number;
  round: (_?: boolean, slience?: boolean) => this | boolean;
  align: (_?: number, slience?: boolean) => this | number;
  clone: () => IBandLikeScale;
  fishEye: (options?: ScaleFishEyeOptions, slience?: boolean, clear?: boolean) => this | ScaleFishEyeOptions;
}

export interface IContinuousScale extends IBaseScale, IRangeFactor {
  readonly type: ContinuousScaleType;
  invert: (y: number) => any;
  rangeRound: (_: any[], slience?: boolean) => this;
  clamp: (_?: boolean, f?: (x: number) => number, slience?: boolean) => this | boolean;
  interpolate: (_?: InterpolateType<any>, slience?: boolean) => this | InterpolateType<any>;
  clone?: () => IContinuousScale;
  rescale: () => this;
  fishEye: (options?: ScaleFishEyeOptions, slience?: boolean, clear?: boolean) => this | ScaleFishEyeOptions;
}

export type ILinearScale = IContinuousScale & IContinuesScaleTicks;

export interface IPowScale extends IContinuousScale, IContinuesScaleTicks {
  exponent: (_?: number, slience?: boolean) => this | number;
}

export interface ILogScale extends IContinuousScale, IContinuesScaleTicks {
  base: (_?: number, slience?: boolean) => this | number;
}

export interface ISymlogScale extends IContinuousScale, IContinuesScaleTicks {
  constant: (_?: number, slience?: boolean) => this | number;
}

export interface IQuantileScale extends Omit<IBaseScale, 'clone' | 'invert' | 'ticks' | 'tickData'> {
  unknown: (_?: any) => this | any;
  invertExtent: (y: any) => any[];
  quantiles: () => number[];
  clone: () => IQuantileScale;
}

export interface IQuantizeScale
  extends Omit<IBaseScale, 'clone' | 'invert' | 'ticks' | 'tickData'>,
    IContinuesScaleTicks {
  unknown: (_?: any) => this | any;
  invertExtent: (y: any) => any[];
  thresholds: () => any[];
  clone: () => IQuantizeScale;
}

export interface IThresholdScale
  extends Omit<IBaseScale, 'clone' | 'invert' | 'ticks' | 'tickData'>,
    IContinuesScaleTicks {
  unknown: (_?: any) => this | any;
  invertExtent: (y: any) => any[];
  clone: () => IQuantizeScale;
}

export type ContinuousTicksFunc = (
  start: number,
  stop: number,
  count: number,
  options?: {
    noDecimals?: boolean;
  }
) => number[];

/** wilkinson 生成ticks */
export type WilkinsonExtendedTicksFunc = (
  start: number,
  stop: number,
  count?: number,
  options?: {
    /** 是否允许扩展min、max，不绝对强制，例如[3, 97] */
    onlyLoose?: boolean;
    /** nice numbers集合 */
    Q?: number[];
    /** 四个优化组件的权重 */
    w?: [number, number, number, number];
  }
) => number[];

/** 自定义ticks方法 */
export type CustomTicksFunc<T extends BaseScale> = (scale: T, count: number) => number[];

export interface NiceOptions {
  forceMin?: number;
  forceMax?: number;
  min?: number;
  max?: number;
}

export type NiceType = 'all' | 'min' | 'max';

export interface ScaleFishEyeOptions {
  distortion?: number;
  focus?: number;
  radius?: number;
  radiusRatio?: number;
}
