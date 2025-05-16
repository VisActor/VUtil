import type { IVennArea, IVennOverlapArc, IVennParams } from './utils/interface';

export interface IVennTransformOptions extends IVennParams {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  setField?: string;
  valueField?: string;
  orientation?: number;
  orientationOrder?: any;
  emptySetKey?: string;
}

export interface IVennTransformMarkOptions {
  datumType: 'circle' | 'overlap';
}

export interface IVennCommonDatum<T = any> extends IVennArea, IVennLabelDatum {
  datum: T;
  x: number;
  y: number;
}

export interface IVennCircleDatum<T = any> extends IVennCommonDatum<T> {
  type: 'circle';
  radius: number;
}

export interface IVennOverlapDatum<T = any> extends IVennCommonDatum<T> {
  type: 'overlap';
  path: string;
  arcs: IVennOverlapArc[];
}

export interface IVennLabelDatum {
  labelX?: number;
  labelY?: number;
}
