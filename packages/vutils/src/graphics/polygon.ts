import type { IPointLike } from '../data-structure';
import { isIntersect } from './algorithm';

const EPSILON = 1e-8;

// Adapted from https://github.com/apache/echarts/blob/master/src/util/graphic.ts by striezel
// License: https://github.com/apache/echarts/blob/master/LICENSE
/**
 * Return `true` if the given line (line `a`) and the given polygon
 * are intersect.
 * Note that we do not count colinear as intersect here because no
 * requirement for that. We could do that if required in future.
 */
export function lineIntersectPolygon(
  a1x: number,
  a1y: number,
  a2x: number,
  a2y: number,
  points: IPointLike[]
): boolean {
  for (let i = 0, p2 = points[points.length - 1]; i < points.length; i++) {
    const p = points[i];
    if (isIntersect([a1x, a1y], [a2x, a2y], [p.x, p.y], [p2.x, p2.y])) {
      return true;
    }
    p2 = p;
  }
  return false;
}

// Adapted from https://github.com/ecomfe/zrender/blob/master/src/contain/polygon.ts by pissang
// License: https://github.com/ecomfe/zrender/blob/master/LICENSE
export function polygonContainPoint(points: IPointLike[], x: number, y: number) {
  let w = 0;
  let p = points[0];

  if (!p) {
    return false;
  }

  for (let i = 1; i < points.length; i++) {
    const p2 = points[i];
    w += isPointInLine(p.x, p.y, p2.x, p2.y, x, y);
    p = p2;
  }

  // Close polygon
  const p0 = points[0];
  if (!isAroundEqual(p.x, p0.x) || !isAroundEqual(p.y, p0.y)) {
    w += isPointInLine(p.x, p.y, p0.x, p0.y, x, y);
  }

  return w !== 0;
}

// Adapted from https://github.com/ecomfe/zrender/blob/master/src/contain/windingLine.ts by pissang
// License: https://github.com/ecomfe/zrender/blob/master/LICENSE
export function isPointInLine(x0: number, y0: number, x1: number, y1: number, x: number, y: number): number {
  if ((y > y0 && y > y1) || (y < y0 && y < y1)) {
    return 0;
  }
  // Ignore horizontal line
  if (y1 === y0) {
    return 0;
  }
  const t = (y - y0) / (y1 - y0);

  let dir = y1 < y0 ? 1 : -1;
  // Avoid winding error when intersection point is the connect point of two line of polygon
  if (t === 1 || t === 0) {
    dir = y1 < y0 ? 0.5 : -0.5;
  }

  const x_ = t * (x1 - x0) + x0;

  // If (x, y) on the line, considered as "contain".
  return x_ === x ? Infinity : x_ > x ? dir : 0;
}

// Adapted from https://github.com/ecomfe/zrender/blob/master/src/contain/polygon.ts by pissang
// License: https://github.com/ecomfe/zrender/blob/master/LICENSE
function isAroundEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

/**
 * polygon图元之间是否相交
 * @param pointsA 图元A的points
 * @param pointsB 图元B的points
 * @returns 是否相交
 */
export function polygonIntersectPolygon(pointsA: IPointLike[], pointsB: IPointLike[]) {
  for (let i = 0; i < pointsB.length; i++) {
    if (polygonContainPoint(pointsA, pointsB[i].x, pointsB[i].y)) {
      return true;
    }
    if (i > 0 && lineIntersectPolygon(pointsB[i - 1].x, pointsB[i - 1].y, pointsB[i].x, pointsB[i].y, pointsA)) {
      return true;
    }
  }
  return false;
}
