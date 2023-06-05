import { radianToDegree } from '../angle';
import type { vec2 } from '../math';
import { cos, sin } from '../math';
import type { IPointLike } from './point';

export interface IMatrixLike {
  a: number;
  /**
   * skew y
   */
  b: number;
  /**
   * skewx
   */
  c: number;
  /**
   * scale y
   */
  d: number;
  /**
   * translate x
   */
  e: number;
  /**
   * translate y
   */
  f: number;
}

// 不建议用户直接操作matrix
export interface IMatrix {
  /**
   * scale x
   */
  a: number;
  /**
   * skew y
   */
  b: number;
  /**
   * skewx
   */
  c: number;
  /**
   * scale y
   */
  d: number;
  /**
   * translate x
   */
  e: number;
  /**
   * translate y
   */
  f: number;

  setValue: (a: number, b: number, c: number, d: number, e: number, f: number) => IMatrix;
  /**
   * 获取当前矩阵的逆矩阵
   */
  getInverse: () => IMatrix;
  rotate: (rad: number) => IMatrix;
  rotateByCenter: (rad: number, cx: number, cy: number) => IMatrix;
  scale: (sx: number, sy: number) => IMatrix;
  setScale: (sx: number, sy: number) => IMatrix;
  transform: (a: number, b: number, c: number, d: number, e: number, f: number) => IMatrix;
  translate: (x: number, y: number) => IMatrix;
  transpose: () => IMatrix;
  equalToMatrix: (m2: IMatrixLike) => boolean;
  equalTo: (a2: number, b2: number, c2: number, d2: number, e2: number, f2: number) => boolean;
  /**
   * 矩阵相乘
   * @param matrix
   */
  multiply: (a2: number, b2: number, c2: number, d2: number, e2: number, f2: number) => IMatrix;
  /**
   * 插值计算
   * @param m2
   * @param t
   */
  interpolate: (m2: IMatrix, t: number) => IMatrix;

  // 将point转到当前矩阵的坐标空间中
  transformPoint: (source: IPointLike, target: IPointLike) => void;

  reset: () => IMatrix;

  // 是否只有translate
  onlyTranslate: (scale?: number) => boolean;

  clone: () => IMatrix;

  toTransformAttrs: () => {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
    rotateDeg: number;
  };
}

export class Matrix implements IMatrix {
  /**
   * scale x
   */
  a: number;
  /**
   * skew y
   */
  b: number;
  /**
   * skewx
   */
  c: number;
  /**
   * scale y
   */
  d: number;
  /**
   * translate x
   */
  e: number;
  /**
   * translate y
   */
  f: number;

  constructor(a: number = 1, b: number = 0, c: number = 0, d: number = 1, e: number = 0, f: number = 0) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
  }

  equalToMatrix(m2: IMatrixLike): boolean {
    // ef -> ad -> bc
    return !(
      this.e !== m2.e ||
      this.f !== m2.f ||
      this.a !== m2.a ||
      this.d !== m2.d ||
      this.b !== m2.b ||
      this.c !== m2.c
    );
  }
  equalTo(a: number, b: number, c: number, d: number, e: number, f: number): boolean {
    // ef -> ad -> bc
    return !(this.e !== e || this.f !== f || this.a !== a || this.d !== d || this.b !== b || this.c !== c);
  }

  setValue(a: number, b: number, c: number, d: number, e: number, f: number) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    return this;
  }

  reset(): this {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
    return this;
  }

  /**
   * 获取当前矩阵的逆矩阵
   */
  getInverse() {
    const a = this.a;
    const b = this.b;
    const c = this.c;
    const d = this.d;
    const e = this.e;
    const f = this.f;
    const m = new Matrix();
    const dt = a * d - b * c;

    m.a = d / dt;
    m.b = -b / dt;
    m.c = -c / dt;
    m.d = a / dt;
    m.e = (c * f - d * e) / dt;
    m.f = -(a * f - b * e) / dt;

    return m;
  }

  rotate(rad: number) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const m11 = this.a * c + this.c * s;
    const m12 = this.b * c + this.d * s;
    const m21 = this.a * -s + this.c * c;
    const m22 = this.b * -s + this.d * c;
    this.a = m11;
    this.b = m12;
    this.c = m21;
    this.d = m22;
    return this;
  }

  rotateByCenter(rad: number, cx: number, cy: number) {
    /** rotate matrix
     * | cos -sin (1-cos)*cx+sin*cy |
     * | sin cos  (1-cos)*cy-sin*cx |
     * | 0   0    1                 |
     * after multiply
     *   m13 = (1-cos)*cx+sin*cy;
     *   m23 = (1-cos)*cy-sin*cx;
     * | cos*a-sin*b cos*c-sin*d cos*e-sin*f+m13 |
     * | sin*a+cos*b sin*c+cos*d sin*e+cos*f+m23 |
     * | 0           0           1               |
     */
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rotateM13 = (1 - cos) * cx + sin * cy;
    const rotateM23 = (1 - cos) * cy - sin * cx;
    const m11 = cos * this.a - sin * this.b;
    const m21 = sin * this.a + cos * this.b;
    const m12 = cos * this.c - sin * this.d;
    const m22 = sin * this.c + cos * this.d;
    const m13 = cos * this.e - sin * this.f + rotateM13;
    const m23 = sin * this.e + cos * this.f + rotateM23;
    this.a = m11;
    this.b = m21;
    this.c = m12;
    this.d = m22;
    this.e = m13;
    this.f = m23;
    return this;
  }

  scale(sx: number, sy: number) {
    this.a *= sx;
    this.b *= sx;
    this.c *= sy;
    this.d *= sy;
    return this;
  }

  setScale(sx: number, sy: number) {
    this.b = (this.b / this.a) * sx;
    this.c = (this.c / this.d) * sy;
    this.a = sx;
    this.d = sy;
    return this;
  }

  transform(a: number, b: number, c: number, d: number, e: number, f: number) {
    this.multiply(a, b, c, d, e, f);
    return this;
  }

  translate(x: number, y: number) {
    this.e += this.a * x + this.c * y;
    this.f += this.b * x + this.d * y;
    return this;
  }

  transpose() {
    /** transpose matrix
     * | 0 1 0 |
     * | 1 0 0 |
     * | 0 0 1 |
     * after multiply
     * | b d f |
     * | a c e |
     * | 0 0 1 |
     */
    const { a, b, c, d, e, f } = this;
    this.a = b;
    this.b = a;
    this.c = d;
    this.d = c;
    this.e = f;
    this.f = e;
    return this;
  }

  /**
   * 矩阵相乘
   * @param matrix
   */
  multiply(a2: number, b2: number, c2: number, d2: number, e2: number, f2: number) {
    const a1 = this.a;
    const b1 = this.b;
    const c1 = this.c;
    const d1 = this.d;
    const e1 = this.e;
    const f1 = this.f;

    const m11 = a1 * a2 + c1 * b2;
    const m12 = b1 * a2 + d1 * b2;
    const m21 = a1 * c2 + c1 * d2;
    const m22 = b1 * c2 + d1 * d2;
    const dx = a1 * e2 + c1 * f2 + e1;
    const dy = b1 * e2 + d1 * f2 + f1;

    this.a = m11;
    this.b = m12;
    this.c = m21;
    this.d = m22;
    this.e = dx;
    this.f = dy;
    return this;
  }

  /**
   * 插值计算
   * @param m2
   * @param t
   */
  interpolate(m2: Matrix, t: number) {
    const m = new Matrix();

    m.a = this.a + (m2.a - this.a) * t;
    m.b = this.b + (m2.b - this.b) * t;
    m.c = this.c + (m2.c - this.c) * t;
    m.d = this.d + (m2.d - this.d) * t;
    m.e = this.e + (m2.e - this.e) * t;
    m.f = this.f + (m2.f - this.f) * t;

    return m;
  }

  /**
   * 将point转到当前矩阵的坐标空间中
   * @param source
   * @param target
   */
  transformPoint(source: IPointLike, target: IPointLike) {
    const { a, b, c, d, e, f } = this;
    const dt = a * d - b * c;

    const nextA = d / dt;
    const nextB = -b / dt;
    const nextC = -c / dt;
    const nextD = a / dt;
    const nextE = (c * f - d * e) / dt;
    const nextF = -(a * f - b * e) / dt;

    const { x, y } = source;
    target.x = x * nextA + y * nextC + nextE;
    target.y = x * nextB + y * nextD + nextF;
  }

  // 只有translate
  onlyTranslate(scale: number = 1): boolean {
    return this.a === scale && this.b === 0 && this.c === 0 && this.d === scale;
  }

  clone(): Matrix {
    return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
  }

  toTransformAttrs() {
    const a = this.a;
    const b = this.b;
    const c = this.c;
    const d = this.d;
    const e = this.e;
    const f = this.f;

    const delta = a * d - b * c;

    const result = {
      x: e,
      y: f,
      rotateDeg: 0,
      scaleX: 0,
      scaleY: 0,
      skewX: 0,
      skewY: 0
    };

    // Apply the QR-like decomposition.
    if (a !== 0 || b !== 0) {
      const r = Math.sqrt(a * a + b * b);
      result.rotateDeg = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
      result.scaleX = r;
      result.scaleY = delta / r;
      result.skewX = (a * c + b * d) / delta;
      result.skewY = 0;
    } else if (c !== 0 || d !== 0) {
      const s = Math.sqrt(c * c + d * d);
      result.rotateDeg = Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
      result.scaleX = delta / s;
      result.scaleY = s;
      result.skewX = 0;
      result.skewY = (a * c + b * d) / delta;
    } else {
      // a = b = c = d = 0
    }

    result.rotateDeg = radianToDegree(result.rotateDeg);

    return result;
  }
}

/**
 * 对matrix进行通常的变换（基于rotateCenter进行旋转的同时进行translate和scale）
 * @param out
 * @param origin
 * @param x
 * @param y
 * @param scaleX
 * @param scaleY
 * @param angle
 * @param rotateCenter
 */
export function normalTransform(
  out: Matrix,
  origin: Matrix,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
  angle: number,
  rotateCenter?: vec2
) {
  const oa = origin.a;
  const ob = origin.b;
  const oc = origin.c;
  const od = origin.d;
  const oe = origin.e;
  const of = origin.f;
  const cosTheta = cos(angle);
  const sinTheta = sin(angle);
  let rotateCenterX: number;
  let rotateCenterY: number;
  if (rotateCenter) {
    rotateCenterX = rotateCenter[0];
    rotateCenterY = rotateCenter[1];
  } else {
    rotateCenterX = x;
    rotateCenterY = y;
  }
  const offsetX = rotateCenterX - x;
  const offsetY = rotateCenterY - y;

  const a1 = oa * cosTheta + oc * sinTheta;
  const b1 = ob * cosTheta + od * sinTheta;
  const c1 = oc * cosTheta - oa * sinTheta;
  const d1 = od * cosTheta - ob * sinTheta;
  out.a = scaleX * a1;
  out.b = scaleX * b1;
  out.c = scaleY * c1;
  out.d = scaleY * d1;

  out.e = oe + oa * rotateCenterX + oc * rotateCenterY - a1 * offsetX - c1 * offsetY;
  out.f = of + ob * rotateCenterX + od * rotateCenterY - b1 * offsetX - d1 * offsetY;
}
