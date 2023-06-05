/* eslint-disable no-redeclare */

// eslint 好像对 ts 的多类型函数重载不支持

import { geoMercator } from 'd3-geo';
const EARTH_RADIUS = 6378100;
export const RELATIVE_EARTH_RADIUS = EARTH_RADIUS / 100;
/**
 * 世界大小,这个应该是对外界无感知的
 * 墨卡托绝对坐标/100
 */
export const WORLD_SIZE = RELATIVE_EARTH_RADIUS * Math.PI * 2;
const fov = (45 / 180) * Math.PI;
const WORLD_HEIGHT = WORLD_SIZE / 2 / Math.tan(fov);
export const BASE_RESOLUTION = WORLD_SIZE;

const PROJECTION_MERCATOR = geoMercator().translate([0, 0]).center([0, 0]).scale(RELATIVE_EARTH_RADIUS);

export function distanceToZoom(distance: number): number {
  return -1 * Math.log2(distance / WORLD_HEIGHT);
}

export function getResolution(canvasHeight: number, zoom: number): number {
  return WORLD_SIZE / canvasHeight / Math.pow(2, zoom);
}
export function getCameraHeight(zoom: number): number {
  return WORLD_HEIGHT / Math.pow(2, zoom);
}

/**
 * 经纬度转相对坐标
 * 传入二维数组,返回二维数组
 * 传入三维数组,返回三维数组
 */
export function project(lnglat: [number, number]): [number, number];
export function project(lnglatheight: [number, number, number]): [number, number, number];
export function project(
  point: [number, number] | [number, number, number]
): [number, number] | [number, number, number] {
  const projection = PROJECTION_MERCATOR;
  if (typeof point[2] === 'undefined') {
    const result = projection(point as [number, number]);
    // 屏幕像素坐标 Y轴 和 WebGL 坐标 Y 轴 方向相反
    result[1] *= -1;
    return result;
  }
  const result = projection(point as [number, number]);
  // 屏幕像素坐标 Y轴 和 WebGL 坐标 Y 轴 方向相反
  result[1] *= -1;
  // height 和 z 直接怎么转换,现在还没有搞清楚,先 1:1 对应
  result.push(point[2]);
  return result;
}

/**
 * 相对坐标转经纬度
 * 传入二维数组,返回二维数组
 * 传入三维数组,返回三维数组
 */
export function unproject(point: [number, number]): [number, number];
export function unproject(point: [number, number, number]): [number, number, number];
export function unproject(
  point: [number, number] | [number, number, number]
): [number, number] | [number, number, number] {
  const projection = PROJECTION_MERCATOR;
  if (typeof point[2] === 'undefined') {
    const result = projection.invert(point as [number, number]);
    // 屏幕像素坐标 Y轴 和 WebGL 坐标 Y 轴 方向相反
    result[1] *= -1;
    return result;
  }
  const result = projection.invert(point as [number, number]);
  result[1];
  // 屏幕像素坐标 Y轴 和 WebGL 坐标 Y 轴 方向相反
  result[1] *= -1;
  // height 和 z 直接怎么转换,现在还没有搞清楚,先 1:1 对应
  result.push(point[2]);
  return result;
}
