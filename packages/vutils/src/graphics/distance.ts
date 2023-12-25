import type { IPoint, IPointLike } from '../data-structure';
import { pow, sqrt } from '../math';

export function distancePP(p1: IPoint, p2: IPointLike): number {
  return sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2));
}

export function distanceNN(x: number, y: number, x1: number, y1: number) {
  return sqrt(pow(x - x1, 2) + pow(y - y1, 2));
}

export function distancePN(point: IPointLike, x: number, y: number) {
  return sqrt(pow(x - point.x, 2) + pow(y - point.y, 2));
}
