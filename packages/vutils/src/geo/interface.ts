import type { IPointLike } from '../data-structure';

export type { Feature, MultiPolygon, Polygon, Units } from '@turf/helpers';

export interface ICircle extends IPointLike {
  radius: number;
  size?: number;
  parent?: ICircle;
}

export interface IIntersectPoint extends IPointLike {
  parentIndex?: number[];
  angle?: number;
}

export interface ICircleArc {
  circle: ICircle;
  width: number;
  p1: IIntersectPoint;
  p2: IIntersectPoint;
}

export interface IOverlapAreaStats {
  area?: number;
  arcArea?: number;
  polygonArea?: number;
  arcs?: ICircleArc[];
  innerPoints?: IPointLike[];
  intersectionPoints?: IIntersectPoint[];
}
