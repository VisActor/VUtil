export const epsilon = 1e-12;
export const pi = Math.PI;
export const halfPi = pi / 2;
export const tau = 2 * pi;
export const NEWTON_ITERATIONS = 4;
export const NEWTON_MIN_SLOPE = 0.001;
export const SUBDIVISION_PRECISION = 0.0000001;
export const SUBDIVISION_MAX_ITERATIONS = 10;
export const pi2 = Math.PI * 2;

export type vec2 = [number, number] | Float32Array;
export type vec3 = [number, number, number] | Float32Array;
export type vec4 = [number, number, number, number] | Float32Array;
export type vec8 = [number, number, number, number, number, number, number, number] | Float32Array;
export type mat4 =
  | [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number
    ]
  | Float32Array;

export const abs = Math.abs;
export const atan2 = Math.atan2;
export const cos = Math.cos;
export const max = Math.max;
export const min = Math.min;
export const sin = Math.sin;
export const sqrt = Math.sqrt;
export const pow = Math.pow;

export function acos(x: number) {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}

export function asin(x: number) {
  return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);
}

/**
 * 根据比例获直线上的点
 * @param {number} x1 起始点 x
 * @param {number} y1 起始点 y
 * @param {number} x2 结束点 x
 * @param {number} y2 结束点 y
 * @param {number} t 指定比例
 * @return {object} 包含 x, y 的点
 */
export function pointAt(
  x1: number | null | undefined,
  y1: number | null | undefined,
  x2: number | null | undefined,
  y2: number | null | undefined,
  t: number
): {
  x: undefined | number;
  y: undefined | number;
} {
  let x: number | undefined;
  let y: number | undefined;
  if (typeof x1 === 'number' && typeof x2 === 'number') {
    x = (1 - t) * x1 + t * x2;
  }
  if (typeof y1 === 'number' && typeof y2 === 'number') {
    y = (1 - t) * y1 + t * y2;
  }
  return {
    x,
    y
  };
}

export function lengthFromPointToLine(
  point: { x: number; y: number },
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  // 面积
  const dir1X = point2.x - point1.x;
  const dir1Y = point2.y - point1.y;
  const dir2X = point.x - point1.x;
  const dir2Y = point.y - point1.y;
  const s = Math.abs(dir1X * dir2Y - dir2X * dir1Y);
  const length = Math.sqrt(dir1X * dir1X + dir1Y * dir1Y);
  return s / length;
}

export function crossProduct(dir1: vec2, dir2: vec2): number {
  return dir1[0] * dir2[1] - dir1[1] * dir2[0];
}

export function crossProductPoint(dir1: { x: number; y: number }, dir2: { x: number; y: number }): number {
  return dir1.x * dir2.y - dir1.y * dir2.x;
}

export function fuzzyEqualNumber(a: number, b: number): boolean {
  return abs(a - b) < epsilon;
}

export function fuzzyEqualVec(a: vec2, b: vec2): boolean {
  return abs(a[0] - b[0]) + abs(a[1] - b[1]) < epsilon;
}

export function fixPrecision(num: number, precision = 10) {
  return Math.round(num * precision) / precision;
}

export function getDecimalPlaces(n: number): number {
  const dStr = n.toString().split(/[eE]/);
  const s = (dStr[0].split('.')[1] || '').length - (+dStr[1] || 0);
  return s > 0 ? s : 0;
}

export function precisionAdd(a: number, b: number) {
  return fixPrecision(a + b, 10 ** Math.max(getDecimalPlaces(a), getDecimalPlaces(b)));
}

export function precisionSub(a: number, b: number) {
  return fixPrecision(a - b, 10 ** Math.max(getDecimalPlaces(a), getDecimalPlaces(b)));
}

export function seedRandom(seed: number) {
  return '0.' + Math.sin(seed).toString().substring(6);
}
