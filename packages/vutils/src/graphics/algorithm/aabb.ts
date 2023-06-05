import type { IBoundsLike } from '../../data-structure';
import type { Point } from './interface';
import { pointInRect } from './intersect';

let x1: number;
let y1: number;
let x2: number;
let y2: number;
export function getAABBFromPoints(points: Point[]): IBoundsLike {
  (x1 = Infinity), (y1 = Infinity), (x2 = -Infinity), (y2 = -Infinity);
  // todo 有优化空间
  points.forEach(point => {
    if (x1 > point.x) {
      x1 = point.x;
    }
    if (x2 < point.x) {
      x2 = point.x;
    }
    if (y1 > point.y) {
      y1 = point.y;
    }
    if (y2 < point.y) {
      y2 = point.y;
    }
  });

  return { x1, y1, x2, y2 };
}

export function pointInAABB(point: Point, aabb: IBoundsLike): boolean {
  return pointInRect(point, aabb, false);
}

export function unionAABB(
  bounds1: IBoundsLike,
  bounds2: IBoundsLike,
  buffer = 3,
  format = false
): [IBoundsLike, IBoundsLike?] {
  let x11 = bounds1.x1;
  let x12 = bounds1.x2;
  let y11 = bounds1.y1;
  let y12 = bounds1.y2;
  let x21 = bounds2.x1;
  let x22 = bounds2.x2;
  let y21 = bounds2.y1;
  let y22 = bounds2.y2;
  if (format) {
    let temp;
    if (x11 > x12) {
      temp = x11;
      x11 = x12;
      x12 = temp;
    }
    if (y11 > y12) {
      temp = y11;
      y11 = y12;
      y12 = temp;
    }
    if (x21 > x22) {
      temp = x21;
      x21 = x22;
      x22 = temp;
    }
    if (y21 > y22) {
      temp = y21;
      y21 = y22;
      y22 = temp;
    }
  }
  // 不相交直接跳过
  if (x11 >= x22 || x12 <= x21 || y11 >= y22 || y12 <= y21) {
    return [bounds1, bounds2];
  }

  const area1 = (x12 - x11 + buffer * 2) * (y12 - y11 + buffer * 2);
  const area2 = (x22 - x21 + buffer * 2) * (y22 - y21 + buffer * 2);
  const x1 = Math.min(x11, x21);
  const y1 = Math.min(y11, y21);
  const x2 = Math.max(x12, x22);
  const y2 = Math.max(y12, y22);
  const unionArea = (x2 - x1) * (y2 - y1);
  if (area1 + area2 > unionArea) {
    return [{ x1, x2, y1, y2 }];
  }
  return [bounds1, bounds2];
}

export function mergeAABB(boundsList: IBoundsLike[]) {
  const nextList: IBoundsLike[] = [];
  function _merge(baseBound: IBoundsLike, list: IBoundsLike[]) {
    const l: IBoundsLike[] = [];
    list.forEach(b => {
      let arr: [IBoundsLike, IBoundsLike?];
      // 相交
      if ((arr = unionAABB(baseBound, b)).length > 1) {
        l.push(b);
        return;
      }
      baseBound = arr[0];
    });
    nextList.push(baseBound);
    l.length && _merge(l[0], l.slice(1));
  }
  _merge(boundsList[0], boundsList.slice(1));
  return nextList;
}
