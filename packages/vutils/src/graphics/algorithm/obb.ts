import type { Point, OBB } from './interface';
import { lengthFromPointToLine, crossProductPoint } from '../../math';

let dirX: number;
let dirY: number;
let normalX: number;
let normalY: number;
let len: number;
let lineWidthDiv2: number;
let width: number;
let height: number;
export function getOBBFromLine(point1: Point, point2: Point, lineWidth: number): OBB {
  dirX = point2.x - point1.x;
  dirY = point2.y - point1.y;
  (normalX = dirY), (normalY = -dirX);
  width = len = Math.sqrt(normalX * normalX + normalY * normalY);
  height = lineWidth;
  normalX /= len;
  normalY /= len;
  lineWidthDiv2 = lineWidth / 2;
  dirX = lineWidthDiv2 * normalX;
  dirY = lineWidthDiv2 * normalY;
  const point11: Point = { x: point1.x + dirX, y: point1.y + dirY };
  const point12: Point = { x: point1.x - dirX, y: point1.y - dirY };
  const point13: Point = { x: point2.x + dirX, y: point2.y + dirY };
  const point14: Point = { x: point2.x - dirX, y: point2.y - dirY };

  return {
    point1: point11,
    point2: point12,
    point3: point13,
    point4: point14,
    width,
    height,
    left: Math.min(point1.x, point2.x) - Math.abs(dirX),
    top: Math.min(point1.y, point2.y) - Math.abs(dirY)
  };
}

const point1: Point = { x: 0, y: 0 };
const point2: Point = { x: 0, y: 0 };
export function pointInOBB(point: Point, obb: OBB): boolean {
  point1.x = (obb.point1.x + obb.point2.x) / 2;
  point1.y = (obb.point1.y + obb.point2.y) / 2;
  point2.x = (obb.point3.x + obb.point4.x) / 2;
  point2.y = (obb.point3.y + obb.point4.y) / 2;

  return pointInLine(point, point1, point2, obb.height);
}

export function pointInLine(point: Point, point1: Point, point2: Point, lineWidth: number): boolean {
  return lengthFromPointToLine(point, point1, point2) <= lineWidth / 2 && pointBetweenLine(point, point1, point2);
}

const dir1: Point = { x: 0, y: 0 };
const dir2: Point = { x: 0, y: 0 };
const normal: Point = { x: 0, y: 0 };
export function pointBetweenLine(point: Point, point1: Point, point2: Point) {
  dir1.x = point1.x - point.x;
  dir1.y = point1.y - point.y;
  dir2.x = point2.x - point.x;
  dir2.y = point2.y - point.y;
  normal.x = point1.y - point2.y;
  normal.y = point2.x - point1.x;
  return crossProductPoint(dir1, normal) * crossProductPoint(dir2, normal) < 0;
}
