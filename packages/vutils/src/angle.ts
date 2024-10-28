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
  if (!radius) {
    return { x: center.x, y: center.y };
  }

  return {
    x: center.x + radius * Math.cos(angleInRadian),
    y: center.y + radius * Math.sin(angleInRadian)
  };
}

/**
 * 根据笛卡尔坐标系坐标计算极坐标坐标点
 * @param point
 * @param center 极坐标系中心点坐标
 * @param startAngle 极坐标系起始角度
 * @param endAngle 极坐标系结束角度
 * @returns 极坐标系坐标点
 */
export function cartesianToPolar(
  point: IPointLike,
  center: IPointLike = { x: 0, y: 0 },
  startAngle = 0,
  endAngle = 2 * Math.PI
) {
  const { x, y } = point;
  const { x: centerX, y: centerY } = center;

  let dx = x - centerX;
  let dy = y - centerY;
  const radius = Math.sqrt(dx * dx + dy * dy);

  if (radius === 0) {
    return {
      radius: 0,
      angle: 0
    };
  }

  dx /= radius;
  dy /= radius;

  let radian = Math.atan2(dy, dx);
  if (radian < startAngle) {
    while (radian <= startAngle) {
      radian += Math.PI * 2;
    }
  }
  if (radian > endAngle) {
    while (radian >= endAngle) {
      radian -= Math.PI * 2;
    }
  }
  return {
    radius,
    angle: radian
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

/**
 * 角度标准化处理
 * @param angle 弧度角
 */
export function normalizeAngle(angle: number): number {
  while (angle < 0) {
    angle += Math.PI * 2;
  }
  while (angle >= Math.PI * 2) {
    angle -= Math.PI * 2;
  }
  return angle;
}

/**
 * 指定开始角度和结束角度，计算这个范围内的边界角度，
 * 即起始角度以及经过的东、南、西、北四个方向的角度
 * 计算这个角度，可以用于计算一个弧度的bounding box 等
 * @param startAngle 起始角度的弧度值
 * @param endAngle    结束角度的弧度值
 * @returns 边界角度数组
 */
export function findBoundaryAngles(startAngle: number, endAngle: number) {
  const deltaAngle = Math.abs(endAngle - startAngle);

  if (deltaAngle >= 2 * Math.PI || 2 * Math.PI - deltaAngle < 1e-6) {
    return [0, Math.PI / 2, Math.PI, 1.5 * Math.PI];
  }
  const min = Math.min(startAngle, endAngle);
  const normalMin = normalizeAngle(min);
  const normalMax = normalMin + deltaAngle;
  const steps = [normalMin, normalMax];
  let directionAngle = (Math.floor(normalMin / Math.PI) * Math.PI) / 2;

  while (directionAngle < normalMax) {
    if (directionAngle > normalMin) {
      steps.push(directionAngle);
    }
    directionAngle += Math.PI / 2;
  }

  return steps;
}
/**
 * 计算指定范围内，指定中心的情况下，不超出边界的最大可用半径
 * @param rect 矩形的大小
 * @param center 中心点
 * @param startAngle 起始角度的弧度值
 * @param endAngle 结束角度的弧度值
 * @returns 最大半径
 */
export function calculateMaxRadius(
  rect: { width: number; height: number },
  center: { x: number; y: number },
  startAngle: number,
  endAngle: number
) {
  const { x, y } = center;
  const steps = findBoundaryAngles(startAngle, endAngle);
  const { width, height } = rect;

  const radiusList: number[] = [];

  steps.forEach(step => {
    const sin = Math.sin(step);
    const cos = Math.cos(step);

    if (sin === 1) {
      radiusList.push(height - y);
    } else if (sin === -1) {
      radiusList.push(y);
    } else if (cos === 1) {
      radiusList.push(width - x);
    } else if (cos === -1) {
      radiusList.push(x);
    } else {
      if (sin > 0) {
        radiusList.push(Math.abs((height - y) / sin));
      } else {
        radiusList.push(Math.abs(y / sin));
      }

      if (cos > 0) {
        radiusList.push(Math.abs((width - x) / cos));
      } else {
        radiusList.push(Math.abs(x / cos));
      }
    }
  });

  return Math.min.apply(null, radiusList);
}

export type Quadrant = 1 | 2 | 3 | 4;

export function computeQuadrant(angle: number): Quadrant {
  angle = normalizeAngle(angle);
  if (angle > 0 && angle <= Math.PI / 2) {
    return 2;
  } else if (angle > Math.PI / 2 && angle <= Math.PI) {
    return 3;
  } else if (angle > Math.PI && angle <= (3 * Math.PI) / 2) {
    return 4;
  }
  return 1;
}
