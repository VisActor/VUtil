import type { IPointLike } from './data-structure/point';
/**
 * 处理角度相关的数据计算
 */

import { tau } from './math';

/**
 * degree -> radian
 * @param degree
 * @returns radian
 */
export function degreeToRadian(degree: number) {
  return degree * (Math.PI / 180);
}

/**
 * radian -> degree
 * @param radian
 * @returns
 */
export function radianToDegree(radian: number) {
  return (radian * 180) / Math.PI;
}

/**
 * 对弧度进行格式化
 * @param a 传入的弧度
 * @returns
 */
export const clampRadian = (angle: number = 0) => {
  if (angle < 0) {
    while (angle < -tau) {
      angle += tau;
    }
  } else if (angle > 0) {
    while (angle > tau) {
      angle -= tau;
    }
  }

  return angle;
};

// alias of clampRadian
export const clampAngleByRadian = clampRadian;

/**
 * 对角度进行格式化
 * @param a 角度
 * @returns
 */
export const clampDegree = (a: number = 0) => {
  if (a > 360 || a < -360) {
    return a % 360;
  }

  return a;
};

// alias of clampDegree
export const clampAngleByDegree = clampDegree;

/**
 * 根据弧度及半径计算极坐标系下的坐标点
 * @param centerX 圆心坐标
 * @param radius 半径
 * @param angleInRadian 弧度
 * @returns 返回笛卡尔坐标点
 */
export function polarToCartesian(center: IPointLike, radius: number, angleInRadian: number): { x: number; y: number } {
  return {
    x: center.x + radius * Math.cos(angleInRadian),
    y: center.y + radius * Math.sin(angleInRadian)
  };
}

/**
 * 根据点的笛卡尔坐标获取该点与圆心的连线同正 x 轴方向的夹角
 * @param center 圆心坐标
 * @param point 待求的点坐标
 * @returns 返回夹角对应的弧度值
 */
export function getAngleByPoint(center: IPointLike, point: IPointLike): number {
  return Math.atan2(point.y - center.y, point.x - center.x);
}
