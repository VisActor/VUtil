import { isArray } from '../common';
import { isRotateAABBIntersect } from '../graphics';
import type { vec4, vec8 } from '../math';
import { abs, epsilon } from '../math';
import type { IMatrix } from './matrix';
import type { IPointLike } from './point';

export type IBoundsLike = Pick<IBounds, 'x1' | 'y1' | 'x2' | 'y2'>;
export type IAABBBoundsLike = IBoundsLike;
export type IOBBBoundsLike = Pick<IOBBBounds, 'x1' | 'y1' | 'x2' | 'y2' | 'angle'>;

export interface IBounds {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  clone: () => IBounds;
  clear: () => IBounds;
  empty: () => boolean;
  equals: (b: IBounds) => boolean;
  set: (x1: number, y1: number, x2: number, y2: number) => IBounds;
  setValue: (x1: number, y1: number, x2: number, y2: number) => IBounds;
  add: (x: number, y: number) => IBounds;
  expand: (d: number) => IBounds;
  round: () => IBounds;
  translate: (dx: number, dy: number) => IBounds;
  rotate: (angle: number, x: number, y: number) => IBounds;
  scale: (sx: number, sy: number, x: number, y: number) => IBounds;
  /**
   * 并集
   * @param b
   * @returns
   */
  union: (b: IBoundsLike) => IBounds;
  /**
   * 交集
   * @param b
   * @returns
   */
  intersect: (b: IBoundsLike) => IBounds;
  /**
   * 是否包含b
   * @param b
   * @returns
   */
  encloses: (b: IBoundsLike) => boolean;
  /**
   * 是否共边
   * @param b
   * @returns
   */
  alignsWith: (b: IBoundsLike) => boolean;
  /**
   * 是否相交
   * @param b
   * @returns
   */
  intersects: (b: IBoundsLike) => boolean;
  /**
   * 是否包含
   * @param x
   * @param y
   * @returns
   */
  contains: (x: number, y: number) => boolean;
  containsPoint: (p: IPointLike) => boolean;
  width: () => number;
  height: () => number;
  scaleX: (s: number) => IBounds;
  scaleY: (s: number) => IBounds;

  copy: (b: IBoundsLike) => IBounds;

  transformWithMatrix: (matrix: IMatrix) => IBounds;
}

export type IAABBBounds = IBounds;

export interface IOBBBounds extends IBounds {
  angle: number;
}

export function transformBoundsWithMatrix(out: IBounds, bounds: IBounds, matrix: IMatrix): IBounds {
  const { x1, y1, x2, y2 } = bounds;
  // 如果没有旋转和缩放，那就直接translate
  if (matrix.onlyTranslate()) {
    if (out !== bounds) {
      out.setValue(bounds.x1, bounds.y1, bounds.x2, bounds.y2);
    }
    out.translate(matrix.e, matrix.f);
    return bounds;
  }
  out.clear();
  out.add(matrix.a * x1 + matrix.c * y1 + matrix.e, matrix.b * x1 + matrix.d * y1 + matrix.f);
  out.add(matrix.a * x2 + matrix.c * y1 + matrix.e, matrix.b * x2 + matrix.d * y1 + matrix.f);
  out.add(matrix.a * x2 + matrix.c * y2 + matrix.e, matrix.b * x2 + matrix.d * y2 + matrix.f);
  out.add(matrix.a * x1 + matrix.c * y2 + matrix.e, matrix.b * x1 + matrix.d * y2 + matrix.f);
  return bounds;
}

/**
 * 依据graphic的属性对bounds进行变换
 * @param bounds
 * @param x
 * @param y
 * @param scaleX
 * @param scaleY
 * @param angle
 * @param rotateCenter
 */
export function transformBounds(
  bounds: IBounds,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
  angle: number,
  rotateCenter?: [number, number]
) {
  if (abs(scaleX) <= epsilon || abs(scaleY) <= epsilon) {
    return;
  }

  scaleX !== 1 && bounds.scaleX(scaleX);
  scaleY !== 1 && bounds.scaleY(scaleY);

  if (isFinite(angle) && Math.abs(angle) > epsilon) {
    let rx = 0;
    let ry = 0;
    if (rotateCenter !== undefined) {
      rx = rotateCenter[0];
      ry = rotateCenter[1];
    }
    bounds.rotate(angle, rx, ry);
  }

  bounds.translate(x, y);
}

/**
Copyright (c) 2015-2021, University of Washington Interactive Data Lab
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
  may be used to endorse or promote products derived from this software
  without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
// 基于Vega的Bounds重构
// https://github.com/vega/vega/blob/825bfaba6ccfe3306183df22b8c955a07bb30714/packages/vega-scenegraph/src/Bounds.js
export class Bounds implements IBounds {
  // 默认初始值是Number.MAX_VALUE
  x1: number;
  y1: number;
  x2: number;
  y2: number;

  constructor(bounds?: Bounds) {
    if (bounds) {
      this.setValue(bounds.x1, bounds.y1, bounds.x2, bounds.y2);
    } else {
      this.clear();
    }
  }

  clone() {
    return new Bounds(this);
  }

  clear(): Bounds {
    this.x1 = +Number.MAX_VALUE;
    this.y1 = +Number.MAX_VALUE;
    this.x2 = -Number.MAX_VALUE;
    this.y2 = -Number.MAX_VALUE;
    return this;
  }
  empty(): boolean {
    return (
      this.x1 === +Number.MAX_VALUE &&
      this.y1 === +Number.MAX_VALUE &&
      this.x2 === -Number.MAX_VALUE &&
      this.y2 === -Number.MAX_VALUE
    );
  }
  equals(b: IBoundsLike): boolean {
    return this.x1 === b.x1 && this.y1 === b.y1 && this.x2 === b.x2 && this.y2 === b.y2;
  }
  setValue(x1: number = 0, y1: number = 0, x2: number = 0, y2: number = 0): Bounds {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    return this;
  }
  set(x1: number = 0, y1: number = 0, x2: number = 0, y2: number = 0): Bounds {
    if (x2 < x1) {
      this.x2 = x1;
      this.x1 = x2;
    } else {
      this.x1 = x1;
      this.x2 = x2;
    }
    if (y2 < y1) {
      this.y2 = y1;
      this.y1 = y2;
    } else {
      this.y1 = y1;
      this.y2 = y2;
    }
    return this;
  }
  add(x: number = 0, y: number = 0): Bounds {
    if (x < this.x1) {
      this.x1 = x;
    }
    if (y < this.y1) {
      this.y1 = y;
    }
    if (x > this.x2) {
      this.x2 = x;
    }
    if (y > this.y2) {
      this.y2 = y;
    }
    return this;
  }
  expand(d: number | [number, number, number, number] = 0): Bounds {
    if (isArray(d)) {
      this.y1 -= d[0];
      this.x2 += d[1];
      this.y2 += d[2];
      this.x1 -= d[3];
    } else {
      this.x1 -= d;
      this.y1 -= d;
      this.x2 += d;
      this.y2 += d;
    }
    return this;
  }
  round(): Bounds {
    this.x1 = Math.floor(this.x1);
    this.y1 = Math.floor(this.y1);
    this.x2 = Math.ceil(this.x2);
    this.y2 = Math.ceil(this.y2);
    return this;
  }
  translate(dx: number = 0, dy: number = 0): Bounds {
    this.x1 += dx;
    this.x2 += dx;
    this.y1 += dy;
    this.y2 += dy;
    return this;
  }
  rotate(angle: number = 0, x: number = 0, y: number = 0) {
    const p = this.rotatedPoints(angle, x, y);
    return this.clear().add(p[0], p[1]).add(p[2], p[3]).add(p[4], p[5]).add(p[6], p[7]);
  }
  scale(sx: number = 0, sy: number = 0, x: number = 0, y: number = 0) {
    const p = this.scalePoints(sx, sy, x, y);
    return this.clear().add(p[0], p[1]).add(p[2], p[3]);
  }
  /**
   * 并集
   * @param b
   * @returns
   */
  union(b: IBoundsLike): Bounds {
    if (b.x1 < this.x1) {
      this.x1 = b.x1;
    }
    if (b.y1 < this.y1) {
      this.y1 = b.y1;
    }
    if (b.x2 > this.x2) {
      this.x2 = b.x2;
    }
    if (b.y2 > this.y2) {
      this.y2 = b.y2;
    }
    return this;
  }
  /**
   * 交集
   * @param b
   * @returns
   */
  intersect(b: IBoundsLike): Bounds {
    if (b.x1 > this.x1) {
      this.x1 = b.x1;
    }
    if (b.y1 > this.y1) {
      this.y1 = b.y1;
    }
    if (b.x2 < this.x2) {
      this.x2 = b.x2;
    }
    if (b.y2 < this.y2) {
      this.y2 = b.y2;
    }
    return this;
  }
  /**
   * 是否包含b
   * @param b
   * @returns
   */
  encloses(b: IBoundsLike): boolean {
    return b && this.x1 <= b.x1 && this.x2 >= b.x2 && this.y1 <= b.y1 && this.y2 >= b.y2;
  }
  /**
   * 是否共边
   * @param b
   * @returns
   */
  alignsWith(b: IBoundsLike): boolean {
    return b && (this.x1 === b.x1 || this.x2 === b.x2 || this.y1 === b.y1 || this.y2 === b.y2);
  }
  /**
   * 是否相交
   * @param b
   * @returns
   */
  intersects(b: IBoundsLike): boolean {
    return b && !(this.x2 < b.x1 || this.x1 > b.x2 || this.y2 < b.y1 || this.y1 > b.y2);
  }
  /**
   * 是否包含
   * @param x
   * @param y
   * @returns
   */
  contains(x: number = 0, y: number = 0): boolean {
    return !(x < this.x1 || x > this.x2 || y < this.y1 || y > this.y2);
  }
  containsPoint(p: IPointLike): boolean {
    return !(p.x < this.x1 || p.x > this.x2 || p.y < this.y1 || p.y > this.y2);
  }
  width(): number {
    if (this.empty()) {
      return 0;
    }
    return this.x2 - this.x1;
  }
  height(): number {
    if (this.empty()) {
      return 0;
    }
    return this.y2 - this.y1;
  }
  scaleX(s: number = 0): Bounds {
    this.x1 *= s;
    this.x2 *= s;
    return this;
  }

  scaleY(s: number = 0): Bounds {
    this.y1 *= s;
    this.y2 *= s;
    return this;
  }

  transformWithMatrix(matrix: IMatrix): Bounds {
    transformBoundsWithMatrix(this, this, matrix);
    return this;
  }

  copy(b: IBoundsLike) {
    this.x1 = b.x1;
    this.y1 = b.y1;
    this.x2 = b.x2;
    this.y2 = b.y2;
    return this;
  }
  private rotatedPoints(angle: number, x: number, y: number): vec8 {
    const { x1, y1, x2, y2 } = this;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const cx = x - x * cos + y * sin;
    const cy = y - x * sin - y * cos;

    return [
      cos * x1 - sin * y1 + cx,
      sin * x1 + cos * y1 + cy,
      cos * x1 - sin * y2 + cx,
      sin * x1 + cos * y2 + cy,
      cos * x2 - sin * y1 + cx,
      sin * x2 + cos * y1 + cy,
      cos * x2 - sin * y2 + cx,
      sin * x2 + cos * y2 + cy
    ];
  }
  private scalePoints(sx: number, sy: number, x: number, y: number): vec4 {
    const { x1, y1, x2, y2 } = this;

    return [sx * x1 + (1 - sx) * x, sy * y1 + (1 - sy) * y, sx * x2 + (1 - sx) * x, sy * y2 + (1 - sy) * y];
  }
}

export class AABBBounds extends Bounds {}
export class OBBBounds extends Bounds {
  angle: number;

  constructor(bounds?: Bounds, angle = 0) {
    super(bounds);
    if (bounds) {
      this.angle = angle;
    }
  }

  intersects(b: OBBBounds): boolean {
    return isRotateAABBIntersect(this, b);
  }

  setValue(x1: number = 0, y1: number = 0, x2: number = 0, y2: number = 0, angle = 0): Bounds {
    super.setValue(x1, y1, x2, y2);
    this.angle = angle;
    return this;
  }
}
