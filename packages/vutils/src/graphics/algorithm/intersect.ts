/* 用于判断2d相交 */
import { degreeToRadian } from '../../angle';
import type { IBoundsLike } from '../../data-structure';
import type { vec2 } from '../../math';
import { pi2, halfPi, crossProduct, fuzzyEqualVec } from '../../math';
import type { Point } from './interface';

function sub(out: vec2, v1: vec2, v2: vec2) {
  out[0] = v1[0] - v2[0];
  out[1] = v1[1] - v2[1];
}

/**
 * 判断直线是否相交，投影法
 * @param left1
 * @param right1
 * @param left2
 * @param right2
 */
export function isIntersect(left1: vec2, right1: vec2, left2: vec2, right2: vec2): boolean {
  let min1: number = left1[0];
  let max1: number = right1[0];
  let min2: number = left2[0];
  let max2: number = right2[0];
  if (max1 < min1) {
    [min1, max1] = [max1, min1];
  }
  if (max2 < min2) {
    [max2, min2] = [min2, max2];
  }
  if (max1 < min2 || max2 < min1) {
    return false;
  }

  (min1 = left1[1]), (max1 = right1[1]), (min2 = left2[1]), (max2 = right2[1]);
  if (max1 < min1) {
    [min1, max1] = [max1, min1];
  }
  if (max2 < min2) {
    [max2, min2] = [min2, max2];
  }
  if (max1 < min2 || max2 < min1) {
    return false;
  }

  return true;
}

/**
 * 获取直线交点
 * 不相交返回false，共线返回true，相交返回交点
 * https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/565282#565282
 * @param left1
 * @param right1
 * @param left2
 * @param right2
 */
export function getIntersectPoint(left1: vec2, right1: vec2, left2: vec2, right2: vec2): boolean | vec2 {
  if (!isIntersect(left1, right1, left2, right2)) {
    return false;
  }
  const dir1: vec2 = [0, 0];
  const dir2: vec2 = [0, 0];
  const tempVec: vec2 = [0, 0];
  sub(dir1, right1, left1);
  sub(dir2, right2, left2);

  // 判断共线
  if (fuzzyEqualVec(dir1, dir2)) {
    return true;
  }

  // https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/565282#565282
  // line1: left1 + dir1 * t
  // line2: left2 + dir2 * u
  // 当 left1 + dir1 * t = left2 + dir2 * u => (left1 + dir1 * t) x dir2 = (left2 + dir2 * u) x dir2
  // => dir1 x dir2 * t = (left2 - left1) x dir2 => t = (left2 - left1) x dir2 / (dir1 x dir2)
  // 直线不平行，dir1 x dir2 ≠ 0，当0 <= t <= 1时，可以求出交点
  sub(tempVec, left2, left1);
  const t = crossProduct(tempVec, dir2) / crossProduct(dir1, dir2);
  if (t >= 0 && t <= 1) {
    return [left1[0] + dir1[0] * t, left1[1] + dir1[1] * t];
  }

  return false;
}

/**
 * 获取两个rect的相交部分
 * 如果有bbox为null，返回null，如果不相交返回{x1: 0, y1: 0, x2: 0, y2: 0}
 * @param bbox1
 * @param bbox2
 * @param format
 */
export function getRectIntersect(
  bbox1: IBoundsLike | null,
  bbox2: IBoundsLike | null,
  format: boolean
): IBoundsLike | null {
  if (bbox1 === null) {
    return bbox2;
  }
  if (bbox2 === null) {
    return bbox1;
  }

  const { x11, x12, y11, y12, x21, x22, y21, y22 } = formatTwoBBox(bbox1, bbox2, format);

  if (x11 >= x22 || x12 <= x21 || y11 >= y22 || y12 <= y21) {
    return { x1: 0, y1: 0, x2: 0, y2: 0 };
  }
  return { x1: Math.max(x11, x21), y1: Math.max(y11, y21), x2: Math.min(x12, x22), y2: Math.min(y12, y22) };
}

export enum InnerBBox {
  NONE = 0,
  BBOX1 = 1,
  BBOX2 = 2
}

const formatTwoBBox = (bbox1: IBoundsLike, bbox2: IBoundsLike, format: boolean) => {
  let x11 = bbox1.x1;
  let x12 = bbox1.x2;
  let y11 = bbox1.y1;
  let y12 = bbox1.y2;
  let x21 = bbox2.x1;
  let x22 = bbox2.x2;
  let y21 = bbox2.y1;
  let y22 = bbox2.y2;

  if (format) {
    if (x11 > x12) {
      [x11, x12] = [x12, x11];
    }
    if (y11 > y12) {
      [y11, y12] = [y12, y11];
    }
    if (x21 > x22) {
      [x21, x22] = [x22, x21];
    }
    if (y21 > y22) {
      [y21, y22] = [y22, y21];
    }
  }
  return { x11, x12, y11, y12, x21, x22, y21, y22 };
};
/**
 * 矩形是否在另一个矩形内部
 * 返回InnerBBox
 * @param bbox1
 * @param bbox2
 * @param format
 */
export function rectInsideAnotherRect(
  bbox1: IBoundsLike | null,
  bbox2: IBoundsLike | null,
  format: boolean
): InnerBBox {
  if (!bbox1 || !bbox2) {
    return InnerBBox.NONE;
  }

  const { x11, x12, y11, y12, x21, x22, y21, y22 } = formatTwoBBox(bbox1, bbox2, format);
  // bbox1在bbox2内部
  if (x11 > x21 && x12 < x22 && y11 > y21 && y12 < y22) {
    return InnerBBox.BBOX1;
  }
  // bbox2在bbox1内部
  if (x21 > x11 && x22 < x12 && y21 > y11 && y22 < y12) {
    return InnerBBox.BBOX2;
  }

  return InnerBBox.NONE;
}

/**
 * 两个矩形是否相交
 * 如果有矩形为null，判断为相交
 * @param bbox1
 * @param bbox2
 * @param format
 */
export function isRectIntersect(bbox1: IBoundsLike | null, bbox2: IBoundsLike | null, format: boolean): boolean {
  if (bbox1 && bbox2) {
    if (!format) {
      if (bbox1.x1 > bbox2.x2 || bbox1.x2 < bbox2.x1 || bbox1.y1 > bbox2.y2 || bbox1.y2 < bbox2.y1) {
        return false;
      }
      return true;
    }

    const { x11, x12, y11, y12, x21, x22, y21, y22 } = formatTwoBBox(bbox1, bbox2, true);

    if (x11 > x22 || x12 < x21 || y11 > y22 || y12 < y21) {
      return false;
    }
    return true;
  }
  return true;
}

/**
 * 点在box内部
 * 如果bbox为null返回true
 * @param point
 * @param bbox
 */
export function pointInRect(point: { x: number; y: number }, bbox: IBoundsLike | null, format: boolean): boolean {
  if (!bbox) {
    return true;
  }
  if (!format) {
    return point.x >= bbox.x1 && point.x <= bbox.x2 && point.y >= bbox.y1 && point.y <= bbox.y2;
  }
  let x11 = bbox.x1;
  let x12 = bbox.x2;
  let y11 = bbox.y1;
  let y12 = bbox.y2;
  if (x11 > x12) {
    [x11, x12] = [x12, x11];
  }
  if (y11 > y12) {
    [y11, y12] = [y12, y11];
  }
  return point.x >= x11 && point.x <= x12 && point.y >= y11 && point.y <= y12;
}

// 参考https://github.com/francecil/leetcode/issues/1

/**
 * 计算投影半径
 * @param {Array(Number)} checkAxis 检测轴 [cosθ,sinθ]
 * @param {Array} axis 目标轴 [x,y]
 */
function getProjectionRadius(checkAxis: [number, number], axis: [number, number]) {
  return Math.abs(axis[0] * checkAxis[0] + axis[1] * checkAxis[1]);
}

/**
 * 逆时针旋转矩阵（从正 x 轴开始，旋转到正 y 轴的方向）
 * [ cos(θ)  -sin(θ) ]
 * [ sin(θ)  cos(θ) ]
 */
export function rotatePoint({ x, y }: Point, rad: number, origin = { x: 0, y: 0 }) {
  return {
    x: (x - origin.x) * Math.cos(rad) - (y - origin.y) * Math.sin(rad) + origin.x,
    y: (x - origin.x) * Math.sin(rad) + (y - origin.y) * Math.cos(rad) + origin.y
  };
}

function getCenterPoint(box: RotateBound): Point {
  return {
    x: (box.x1 + box.x2) / 2,
    y: (box.y1 + box.y2) / 2
  };
}

interface RotateBound extends IBoundsLike {
  angle: number;
  rotateCenter?: { x: number; y: number };
}

/**
 * 转化为顶点坐标数组
 * @param {Object} box
 */
function toRect(box: RotateBound, isDeg: boolean) {
  const deg = isDeg ? degreeToRadian(box.angle) : box.angle;
  const cp = getCenterPoint(box);
  return [
    rotatePoint(
      {
        x: box.x1,
        y: box.y1
      },
      deg,
      cp
    ),
    rotatePoint(
      {
        x: box.x2,
        y: box.y1
      },
      deg,
      cp
    ),
    rotatePoint(
      {
        x: box.x2,
        y: box.y2
      },
      deg,
      cp
    ),
    rotatePoint(
      {
        x: box.x1,
        y: box.y2
      },
      deg,
      cp
    )
  ];
}
export function isRotateAABBIntersect(box1: RotateBound, box2: RotateBound, isDeg = false) {
  const rect1 = toRect(box1, isDeg);
  const rect2 = toRect(box2, isDeg);

  const vector = (start: Point, end: Point) => {
    return [end.x - start.x, end.y - start.y] as [number, number];
  };

  // 两个矩形的中心点
  const p1 = getCenterPoint(box1);
  const p2 = getCenterPoint(box2);
  // 向量 p1p2
  const vp1p2 = vector(p1, p2);

  //矩形1的两边向量
  const AB = vector(rect1[0], rect1[1]);
  const BC = vector(rect1[1], rect1[2]);
  //矩形2的两边向量
  const A1B1 = vector(rect2[0], rect2[1]);
  const B1C1 = vector(rect2[1], rect2[2]);

  // 矩形1 的两个弧度
  const deg11 = isDeg ? degreeToRadian(box1.angle) : box1.angle;
  let deg12 = isDeg ? degreeToRadian(90 - box1.angle) : box1.angle + halfPi;
  // 矩形2 的两个弧度
  const deg21 = isDeg ? degreeToRadian(box2.angle) : box2.angle;
  let deg22 = isDeg ? degreeToRadian(90 - box2.angle) : box2.angle + halfPi;
  if (deg12 > pi2) {
    deg12 -= pi2;
  }
  if (deg22 > pi2) {
    deg22 -= pi2;
  }

  // 投影重叠
  const isCover = (
    checkAxisRadius: number,
    deg: number,
    targetAxis1: [number, number],
    targetAxis2: [number, number]
  ) => {
    const checkAxis = [Math.cos(deg), Math.sin(deg)] as [number, number];
    const targetAxisRadius =
      (getProjectionRadius(checkAxis, targetAxis1) + getProjectionRadius(checkAxis, targetAxis2)) / 2;
    const centerPointRadius = getProjectionRadius(checkAxis, vp1p2);
    // console.log('abc', `checkAxis:${checkAxis},三个投影:${checkAxisRadius}, ${targetAxisRadius}, ${centerPointRadius}`)
    return checkAxisRadius + targetAxisRadius > centerPointRadius;
  };

  return (
    isCover((box1.x2 - box1.x1) / 2, deg11, A1B1, B1C1) &&
    isCover((box1.y2 - box1.y1) / 2, deg12, A1B1, B1C1) &&
    isCover((box2.x2 - box2.x1) / 2, deg21, AB, BC) &&
    isCover((box2.y2 - box2.y1) / 2, deg22, AB, BC)
  );
}
