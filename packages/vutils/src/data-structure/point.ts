import isNumber from '../common/isNumber';
import { pow, sqrt } from '../math';

export interface IPoint {
  x: number;
  y: number;
  x1?: number;
  y1?: number;
  defined?: boolean; // defined表示这个点是否存在
  context?: any; // context stores addition information for point

  clone: () => IPoint;
  copyFrom: (p: IPointLike) => IPoint;
  set: (x: number, y: number) => IPoint;
  add: (point: IPointLike | number) => IPoint;
  sub: (point: IPointLike | number) => IPoint;
  multi: (point: IPointLike | number) => IPoint;
  div: (point: IPointLike | number) => IPoint;
}

export type IPointLike = Pick<IPoint, 'x' | 'y' | 'x1' | 'y1' | 'defined' | 'context'>;

export class Point implements IPoint {
  /**
   * 面积图的下点
   */
  x: number = 0;
  y: number = 0;
  x1?: number;
  y1?: number;
  defined?: boolean;
  context?: any;

  constructor(x: number = 0, y: number = 0, x1?: number, y1?: number) {
    this.x = x;
    this.y = y;
    this.x1 = x1;
    this.y1 = y1;
  }

  clone(): Point {
    return new Point(this.x, this.y);
  }

  copyFrom(p: IPointLike): this {
    this.x = p.x;
    this.y = p.y;
    this.x1 = p.x1;
    this.y1 = p.y1;
    this.defined = p.defined;
    this.context = p.context;
    return this;
  }

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  add(point: IPointLike | number): IPoint {
    if (isNumber(point)) {
      this.x += point as number;
      this.y += point as number;
      return;
    }
    this.x += (<IPointLike>point).x;
    this.y += (<IPointLike>point).y;
    return this;
  }
  sub(point: IPointLike | number): IPoint {
    if (isNumber(point)) {
      this.x -= point as number;
      this.y -= point as number;
      return;
    }
    this.x -= (<IPointLike>point).x;
    this.y -= (<IPointLike>point).y;
    return this;
  }
  multi(point: IPointLike | number): IPoint {
    throw new Error('暂不支持');
  }
  div(point: IPointLike | number): IPoint {
    throw new Error('暂不支持');
  }
}

// TODO: 删除，使用单个 ../graphics/distance 替代
export class PointService {
  /* distance */
  static distancePP(p1: IPointLike, p2: IPointLike): number {
    return sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2));
  }
  static distanceNN(x: number, y: number, x1: number, y1: number) {
    return sqrt(pow(x - x1, 2) + pow(y - y1, 2));
  }
  /* point at */
  static pointAtPP(p1: IPointLike, p2: IPointLike, t: number): IPoint {
    return new Point((p2.x - p1.x) * t + p1.x, (p2.y - p1.y) * t + p1.y);
  }
}

export function pointAtPP(p1: IPointLike, p2: IPointLike, t: number): IPoint {
  return new Point((p2.x - p1.x) * t + p1.x, (p2.y - p1.y) * t + p1.y);
}

export interface IPolarPoint {
  r: number;
  theta: number;
  r1?: number;
  theta1?: number;
  defined?: boolean;
  context?: any;

  clone: () => IPolarPoint;
  copyFrom: (p: IPolarPoint) => IPolarPoint;
  set: (x: number, y: number) => IPolarPoint;
  // TODO: support if needed
  // add: (point: IPolarPoint | number) => IPolarPoint;
  // sub: (point: IPolarPoint | number) => IPolarPoint;
  // multi: (point: IPolarPoint | number) => IPolarPoint;
  // div: (point: IPolarPoint | number) => IPolarPoint;
}

export declare type IPolarPointLike = Pick<IPolarPoint, 'r' | 'theta' | 'r1' | 'theta1' | 'defined' | 'context'>;

export class PolarPoint implements IPolarPoint {
  r: number = 0;
  theta: number = 0;
  r1?: number;
  theta1?: number;
  defined?: boolean;
  context?: any;

  constructor(r: number = 0, theta: number = 0, r1?: number, theta1?: number) {
    this.r = r;
    this.theta = theta;
    this.r1 = r1;
    this.theta1 = theta1;
  }

  clone(): PolarPoint {
    return new PolarPoint(this.r, this.theta);
  }

  copyFrom(p: IPolarPointLike): this {
    this.r = p.r;
    this.theta = p.theta;
    this.r1 = p.r1;
    this.theta1 = p.theta1;
    this.defined = p.defined;
    this.context = p.context;
    return this;
  }

  set(r: number, theta: number): this {
    this.r = r;
    this.theta = theta;
    return this;
  }
}
