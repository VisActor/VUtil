import { toNumber, isGreater, isLess, isNumber, isValid, isNil, clamp } from '@visactor/vutils';
import { OrdinalScale, implicit } from './ordinal-scale';
import {
  bandSpace,
  calculateBandwidthFromWholeRangeSize,
  calculateWholeRangeFromRangeFactor,
  scaleWholeRangeSize
} from './utils/utils';
import { ScaleEnum } from './type';
import { stepTicks, ticks } from './utils/tick-sample-int';
import type { DiscreteScaleType, IBandLikeScale, ScaleFishEyeOptions, TickData } from './interface';

// band scale 各参数参考图示 https://raw.githubusercontent.com/d3/d3-scale/master/img/band.png
export class BandScale extends OrdinalScale implements IBandLikeScale {
  readonly type: DiscreteScaleType = ScaleEnum.Band;
  protected _step?: number;
  protected _bandwidth?: number;
  /** 是否固定了 bandwidth */
  protected _isFixed?: boolean;
  /** 用户配置的 bandwidth */
  protected _userBandwidth?: number | 'auto';
  protected _maxBandwidth?: number;
  protected _minBandwidth?: number;
  protected _round: boolean;
  protected _paddingInner: number;
  protected _paddingOuter: number;
  protected _align: number;
  protected _range: Array<number>;
  protected _bandRangeState?: { reverse: boolean; start: number; min: number; max: number; count: number };

  constructor(slience?: boolean) {
    super();
    this._range = [0, 1];
    this._step = undefined;
    this._bandwidth = undefined;
    this._isFixed = false;
    this._round = false;
    this._paddingInner = 0;
    this._paddingOuter = 0;
    this._align = 0.5;
    this._unknown = undefined;
    delete this.unknown;

    this.rescale(slience);
  }

  rescale(slience?: boolean, changeProperty?: keyof IBandLikeScale): this {
    if (slience) {
      return this;
    }
    this._wholeRange = null;
    const wholeRange = this._calculateWholeRange(this._range, changeProperty);
    const n = super.domain().length;
    const reverse = wholeRange[1] < wholeRange[0];
    let start = wholeRange[Number(reverse) - 0];
    const stop = wholeRange[1 - Number(reverse)];
    const space = bandSpace(n, this._paddingInner, this._paddingOuter);

    this._step = (stop - start) / Math.max(1, space || 1);
    if (this._round) {
      this._step = Math.floor(this._step);
    }
    start += (stop - start - this._step * (n - this._paddingInner)) * this._align;
    if (!this.isBandwidthFixed()) {
      this._bandwidth = this._step * (1 - this._paddingInner);
    }
    if (this._round) {
      start = Math.round(start);
      if (!this.isBandwidthFixed()) {
        this._bandwidth = Math.round(this._bandwidth);
      }
    }

    this._bandRangeState = {
      reverse,
      start: reverse
        ? clamp(start + this._step * (n - 1), wholeRange[1], wholeRange[0]) // 防止计算精度问题导致的start 超出区间
        : clamp(start, wholeRange[0], wholeRange[1]),
      min: reverse ? wholeRange[1] : wholeRange[0],
      max: stop,
      count: n
    };

    this.generateFishEyeTransform();

    return this;
  }

  scale(d: any): any {
    if (!this._bandRangeState) {
      return undefined;
    }
    const key = `${d}`;
    const special = this._getSpecifiedValue(key);
    if (special !== undefined) {
      return special;
    }
    let i = this._index.get(key);
    if (!i) {
      if (this._unknown !== implicit) {
        return this._unknown;
      }
      // TODO checkPoint
      i = this._domain.push(d);
      this._index.set(key, i);
    }
    const { count, start, reverse, min, max } = this._bandRangeState;
    const stepIndex = (i - 1) % count;

    const output = start + (reverse ? -1 : 1) * stepIndex * this._step;

    return clamp(this._fishEyeTransform ? this._fishEyeTransform(output) : output, min, max);
  }

  /**
   * 根据可见 range 计算 scale 的整体 range
   * @param range 可见 range
   * @returns
   */
  protected _calculateWholeRange(range: any[], changeProperty?: keyof IBandLikeScale) {
    if (this._wholeRange) {
      return this._wholeRange;
    }

    if ((this._minBandwidth || this._maxBandwidth) && !this._isBandwidthFixedByUser()) {
      let wholeSize: number;
      if (isValid(this._rangeFactorStart) && isValid(this._rangeFactorEnd) && range.length === 2) {
        const wholeRange = calculateWholeRangeFromRangeFactor(range, [this._rangeFactorStart, this._rangeFactorEnd]);
        wholeSize = Math.abs(wholeRange[1] - wholeRange[0]);
      } else {
        wholeSize = Math.abs(range[1] - range[0]);
      }
      const autoBandwidth = calculateBandwidthFromWholeRangeSize(
        super.domain().length,
        wholeSize,
        this._paddingInner,
        this._paddingOuter,
        this._round
      );
      if (autoBandwidth < this._minBandwidth) {
        this._bandwidth = this._minBandwidth;
        this._isFixed = true;
      } else if (autoBandwidth > this._maxBandwidth) {
        this._bandwidth = this._maxBandwidth;
        this._isFixed = true;
      } else {
        this._bandwidth = autoBandwidth;
        this._isFixed = false;
      }
    }

    if (this.isBandwidthFixed()) {
      const wholeLength =
        scaleWholeRangeSize(super.domain().length, this._bandwidth, this._paddingInner, this._paddingOuter) *
        Math.sign(range[1] - range[0]);
      const rangeFactorSize = Math.min((range[1] - range[0]) / wholeLength, 1);
      if (isValid(this._rangeFactorStart) && isValid(this._rangeFactorEnd)) {
        const canAlignStart = this._rangeFactorStart + rangeFactorSize <= 1;
        const canAlignEnd = this._rangeFactorEnd - rangeFactorSize >= 0;

        if (changeProperty === 'rangeFactorStart' && canAlignStart) {
          this._rangeFactorEnd = this._rangeFactorStart + rangeFactorSize;
        } else if (changeProperty === 'rangeFactorEnd' && canAlignEnd) {
          this._rangeFactorStart = this._rangeFactorEnd - rangeFactorSize;
        } else {
          // 判断 scale 方向来决定边界检测顺序
          if (range[0] <= range[1]) {
            if (canAlignStart) {
              this._rangeFactorEnd = this._rangeFactorStart + rangeFactorSize;
            } else if (canAlignEnd) {
              this._rangeFactorStart = this._rangeFactorEnd - rangeFactorSize;
            } else {
              this._rangeFactorStart = 0;
              this._rangeFactorEnd = rangeFactorSize;
            }
          } else {
            if (canAlignEnd) {
              this._rangeFactorStart = this._rangeFactorEnd - rangeFactorSize;
            } else if (canAlignStart) {
              this._rangeFactorEnd = this._rangeFactorStart + rangeFactorSize;
            } else {
              this._rangeFactorStart = 1 - rangeFactorSize;
              this._rangeFactorEnd = 1;
            }
          }
        }

        if (wholeLength > 0) {
          const r0 = range[0] - wholeLength * this._rangeFactorStart;
          const r1 = r0 + wholeLength;
          this._wholeRange = [r0, r1];
        } else {
          const r1 = range[1] + wholeLength * (1 - this._rangeFactorEnd);
          const r0 = r1 - wholeLength;
          this._wholeRange = [r0, r1];
        }
      } else {
        this._rangeFactorStart = 0;
        this._rangeFactorEnd = rangeFactorSize;
        this._wholeRange = [range[0], range[0] + wholeLength];
      }

      return this._wholeRange;
    }

    return super._calculateWholeRange(range);
  }

  calculateWholeRangeSize() {
    const wholeRange = this._calculateWholeRange(this._range);
    return Math.abs(wholeRange[1] - wholeRange[0]);
  }

  calculateVisibleDomain(range: any[]) {
    const domain = this._domain;

    if (isValid(this._rangeFactorStart) && isValid(this._rangeFactorEnd) && domain.length) {
      const d0 = this._getInvertIndex(range[0]);
      const d1 = this._getInvertIndex(range[1]);

      return domain.slice(Math.min(d0, d1), Math.max(d0, d1) + 1);
    }

    return domain;
  }

  domain(): any[];
  domain(_: any[], slience?: boolean): this;
  domain(_?: any[], slience?: boolean): this | any[] {
    if (_) {
      super.domain(_);

      return this.rescale(slience);
    }
    return super.domain();
  }

  range(): any[];
  range(_: any[], slience?: boolean): this;
  range(_?: any[], slience?: boolean): this | any[] {
    if (_) {
      this._range = [toNumber(_[0]), toNumber(_[1])];
      return this.rescale(slience);
    }
    return this._range;
  }

  rangeRound(_: any[], slience?: boolean): this {
    this._range = [toNumber(_[0]), toNumber(_[1])];
    this._round = true;
    return this.rescale(slience);
  }

  ticks(count: number = 10) {
    const d = this.calculateVisibleDomain(this._range);

    if (count === -1) {
      // return domain as ticks when count is -1
      return d;
    }

    const tickIndexList = ticks(0, d.length - 1, count, false);
    return tickIndexList.map(i => d[i]);
  }

  tickData(count: number = 10): TickData[] {
    const ticks = this.ticks(count);
    return ticks.map((tick, index) => {
      const scaledValue = this.scale(tick);
      return {
        index,
        tick,
        value: (scaledValue - this._range[0] + this._bandwidth / 2) / (this._range[1] - this._range[0])
      };
    });
  }

  /**
   * 生成tick数组，这个tick数组的长度就是count的长度
   * @param count
   */
  forceTicks(count: number = 10): any[] {
    const d = this.calculateVisibleDomain(this._range);
    const tickIndexList = ticks(0, d.length - 1, count, true);
    return tickIndexList
      .filter(i => i < d.length) // 截断不存在的index
      .map(i => d[i]);
  }

  /**
   * 基于给定step的ticks数组生成
   * @param step
   */
  stepTicks(step: number): any[] {
    const d = this.calculateVisibleDomain(this._range);
    const tickIndexList = stepTicks(0, d.length - 1, step);
    return tickIndexList.map(i => d[i]);
  }

  protected _getInvertIndex(d: any): any {
    // 找到index
    let i = 0;
    const halfStep = this.step() / 2;
    const halfBandwidth = this.bandwidth() / 2;
    const len = this._domain.length;
    const range = this.range();
    const start = range[0];
    const stop = range[range.length - 1];
    const reverse = start > stop;

    for (i = 0; i < len; i++) {
      const r = this.scale(this._domain[i]) + halfBandwidth;

      if (i === 0 && ((!reverse && !isGreater(d, r + halfStep)) || (reverse && !isLess(d, r - halfStep)))) {
        break;
      }

      if (i === len - 1) {
        break;
      }

      if (!isLess(d, r - halfStep) && !isGreater(d, r + halfStep)) {
        break;
      }
    }

    if (i >= 0 && i <= len - 1) {
      return i;
    }

    return len - 1;
  }

  invert(d: any): any {
    return this._domain[this._getInvertIndex(d)];
  }

  padding(p: number | number[], slience?: boolean): this;
  padding(): number;
  padding(p?: number | [number, number], slience?: boolean): this | number {
    if (p !== undefined) {
      this._paddingOuter = Math.max(0, Math.min(Array.isArray(p) ? Math.min.apply(null, p) : p));
      this._paddingInner = this._paddingOuter;
      return this.rescale(slience);
    }
    return this._paddingInner;
  }

  paddingInner(p: number, slience?: boolean): this;
  paddingInner(): number;
  paddingInner(_?: number, slience?: boolean) {
    if (_ !== undefined) {
      this._paddingInner = Math.max(0, Math.min(1, _));
      return this.rescale(slience);
    }
    return this._paddingInner;
  }

  paddingOuter(p: number, slience?: boolean): this;
  paddingOuter(): number;
  paddingOuter(_?: number, slience?: boolean) {
    if (_ !== undefined) {
      this._paddingOuter = Math.max(0, Math.min(1, _));
      return this.rescale(slience);
    }
    return this._paddingOuter;
  }

  step(): number {
    return this._step;
  }

  round(_: boolean, slience?: boolean): this;
  round(): boolean;
  round(_?: boolean, slience?: boolean): this | boolean {
    if (_ !== undefined) {
      this._round = _;
      return this.rescale(slience);
    }
    return this._round;
  }

  align(_: number, slience?: boolean): this;
  align(): number;
  align(_?: number, slience?: boolean): this | number {
    if (_ !== undefined) {
      this._align = Math.max(0, Math.min(1, _));
      return this.rescale(slience);
    }
    return this._align;
  }

  rangeFactor(): [number, number];
  rangeFactor(_: [number, number], slience?: boolean): this;
  rangeFactor(_?: [number, number], slience?: boolean): this | any[] {
    if (!_) {
      return super.rangeFactor();
    }
    super.rangeFactor(_);
    return this.rescale(slience);
  }

  rangeFactorStart(): number;
  rangeFactorStart(_: number, slience?: boolean): this;
  rangeFactorStart(_?: number, slience?: boolean): this | any {
    if (isNil(_)) {
      return super.rangeFactorStart();
    }
    super.rangeFactorStart(_);
    return this.rescale(slience, 'rangeFactorStart');
  }

  rangeFactorEnd(): number;
  rangeFactorEnd(_: number, slience?: boolean): this;
  rangeFactorEnd(_?: number, slience?: boolean): this | any {
    if (isNil(_)) {
      return super.rangeFactorEnd();
    }
    super.rangeFactorEnd(_);
    return this.rescale(slience, 'rangeFactorEnd');
  }

  bandwidth(): number;
  bandwidth(_: number | 'auto', slience?: boolean): this;
  bandwidth(_?: number | 'auto', slience?: boolean): this | number {
    if (!_) {
      return this._bandwidth;
    }
    if (_ === 'auto') {
      this._bandwidth = undefined;
      this._isFixed = false;
    } else {
      this._bandwidth = _;
      this._isFixed = true;
    }
    this._userBandwidth = _;
    return this.rescale(slience);
  }

  maxBandwidth(): number;
  maxBandwidth(_: number | 'auto', slience?: boolean): this;
  maxBandwidth(_?: number | 'auto', slience?: boolean): this | number {
    if (!_) {
      return this._maxBandwidth;
    }
    if (_ === 'auto') {
      this._maxBandwidth = undefined;
    } else {
      this._maxBandwidth = _;
    }
    return this.rescale(slience);
  }

  minBandwidth(): number;
  minBandwidth(_: number | 'auto', slience?: boolean): this;
  minBandwidth(_?: number | 'auto', slience?: boolean): this | number {
    if (!_) {
      return this._minBandwidth;
    }
    if (_ === 'auto') {
      this._minBandwidth = undefined;
    } else {
      this._minBandwidth = _;
    }
    return this.rescale(slience);
  }

  fishEye(): ScaleFishEyeOptions;
  fishEye(options: ScaleFishEyeOptions, slience?: boolean, clear?: boolean): this;
  fishEye(options?: ScaleFishEyeOptions, slience?: boolean, clear?: boolean): this | ScaleFishEyeOptions {
    if (options || clear) {
      this._fishEyeOptions = options;
      this._fishEyeTransform = null;

      return this.rescale(slience);
    }

    return this._fishEyeOptions;
  }

  isBandwidthFixed() {
    return this._isFixed && !!this._bandwidth;
  }

  protected _isBandwidthFixedByUser() {
    return this._isFixed && this._userBandwidth && isNumber(this._userBandwidth);
  }

  clone(): IBandLikeScale {
    const bandScale = new BandScale(true)
      .domain(this._domain, true)
      .range(this._range, true)
      .round(this._round, true)
      .paddingInner(this._paddingInner, true)
      .paddingOuter(this._paddingOuter, true)
      .align(this._align, true)
      .bandwidth(this._userBandwidth ?? 'auto', true)
      .maxBandwidth(this._maxBandwidth ?? 'auto', true)
      .minBandwidth(this._maxBandwidth ?? 'auto');
    return bandScale;
  }
}
