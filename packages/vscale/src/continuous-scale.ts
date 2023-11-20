import { BaseScale } from './base-scale';
import type {
  BimapType,
  InterpolateType,
  PolymapType,
  TransformType,
  IContinuousScale,
  ContinuousScaleType,
  TickData,
  NiceType,
  ScaleFishEyeOptions
} from './interface';
import { interpolate } from './utils/interpolate';
import { bimap, identity, polymap } from './utils/utils';
import { clamper, toNumber, interpolateNumberRound, interpolateNumber, isValid } from '@visactor/vutils';

export class ContinuousScale extends BaseScale implements IContinuousScale {
  readonly type: ContinuousScaleType;
  protected transformer: TransformType;
  protected untransformer: TransformType;

  protected _niceDomain: number[];
  protected _niceType?: NiceType;
  protected _domain: number[];
  protected _range: any[];
  protected _unknown: any = undefined;
  protected _forceAlign: boolean;

  protected _output?: (x: number) => number;
  protected _input?: (x: number) => number;
  protected _interpolate?: InterpolateType<any>;
  protected _piecewise: BimapType<any> | PolymapType<any>;
  protected _domainValidator?: (val: number) => boolean;

  _clamp?: (x: number) => number;

  constructor(transformer: TransformType = identity, untransformer: TransformType = identity) {
    super();
    this.transformer = transformer;
    this.untransformer = untransformer;

    this._forceAlign = true;
    this._domain = [0, 1];
    this._range = [0, 1];
    this._clamp = identity;
    this._piecewise = bimap;
    this._interpolate = interpolate;
  }

  calculateVisibleDomain(range: any[]) {
    if (isValid(this._rangeFactorStart) && isValid(this._rangeFactorEnd) && range.length === 2) {
      const d0 = this.invert(range[0]);
      const d1 = this.invert(range[1]);

      return [d0, d1];
    }

    return this._niceDomain ?? this._domain;
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

  scale(x: any): any {
    x = Number(x);
    if (Number.isNaN(x) || (this._domainValidator && !this._domainValidator(x))) {
      return this._unknown;
    }
    if (!this._output) {
      this._output = (this._piecewise as PolymapType<any>)(
        (this._niceDomain ?? this._domain).map(this.transformer),
        this._calculateWholeRange(this._range),
        this._interpolate
      );
    }
    const output = this._output(this.transformer(this._clamp(x)));

    return this._fishEyeTransform ? this._fishEyeTransform(output) : output;
  }

  invert(y: any): any {
    if (!this._input) {
      this._input = (this._piecewise as PolymapType<any>)(
        this._calculateWholeRange(this._range),
        (this._niceDomain ?? this._domain).map(this.transformer),
        interpolateNumber
      );
    }
    return this._clamp(this.untransformer(this._input(y)));
  }

  domain(): any[];
  domain(_: any[], slience?: boolean): this;
  domain(_?: any[], slience?: boolean): this | any[] {
    if (!_) {
      return (this._niceDomain ?? this._domain).slice();
    }
    this._domainValidator = null;
    this._niceType = null;
    this._niceDomain = null;
    const nextDomain = Array.from(_, toNumber) as [number, number];

    this._domain = nextDomain;
    return this.rescale(slience);
  }

  range(): any[];
  range(_: any[], slience?: boolean): this;
  range(_?: any[], slience?: boolean): this | any[] {
    if (!_) {
      return this._range.slice();
    }

    const nextRange = Array.from(_) as [number, number];
    this._range = nextRange;
    return this.rescale(slience);
  }

  rangeRound(_: any[], slience?: boolean): this {
    const nextRange = Array.from(_) as [number, number];
    this._range = nextRange;
    this._interpolate = interpolateNumberRound;
    return this.rescale(slience);
  }

  rescale(slience?: boolean): this {
    if (slience) {
      return this;
    }
    const domain = this._niceDomain ?? this._domain;
    const domainLength = domain.length;
    const rangeLength = this._range.length;
    let n = Math.min(domainLength, rangeLength);

    if (domainLength && domainLength < rangeLength && this._forceAlign) {
      // insert steps to domain
      const deltaStep = rangeLength - domainLength + 1;
      const last = domain[domainLength - 1];
      const delta = domainLength >= 2 ? (last - domain[domainLength - 2]) / deltaStep : 0;

      for (let i = 1; i <= deltaStep; i++) {
        domain[domainLength - 2 + i] = last - delta * (deltaStep - i);
      }
      n = rangeLength;
    }

    if (this._clamp === undefined) {
      this._clamp = clamper(domain[0], domain[n - 1]);
    }
    this._piecewise = n > 2 ? polymap : bimap;
    this._output = this._input = null;
    this._wholeRange = null;

    this.generateFishEyeTransform();
    return this;
  }

  clamp(): boolean;
  clamp(_: boolean, f?: (x: number) => number, slience?: boolean): this;
  clamp(_?: boolean, f?: (x: number) => number, slience?: boolean): this | boolean {
    if (!arguments.length) {
      return this._clamp !== identity;
    }
    if (f) {
      this._clamp = f;
    } else {
      this._clamp = _ ? undefined : identity;
    }

    return this.rescale(slience);
  }

  interpolate(): InterpolateType<any>;
  interpolate(_: InterpolateType<any>, slience?: boolean): this;
  interpolate(_?: InterpolateType<any>, slience?: boolean) {
    if (!arguments.length) {
      return this._interpolate;
    }
    this._interpolate = _;
    return this.rescale(slience);
  }

  ticks(count: number = 10): any[] {
    return [];
  }

  tickData(count: number = 10): TickData[] {
    const ticks = this.ticks(count);
    return (ticks ?? []).map((tick, index) => {
      const scaledValue = this.scale(tick);
      return {
        index,
        tick,
        value: (scaledValue - this._range[0]) / (this._range[1] - this._range[0])
      };
    });
  }

  rangeFactor(): [number, number];
  rangeFactor(_: [number, number], slience?: boolean): this;
  rangeFactor(_?: [number, number], slience?: boolean): this | any[] {
    if (!_) {
      return super.rangeFactor();
    }
    super.rangeFactor(_);
    this._output = this._input = null;

    return this;
  }

  rangeFactorStart(): number;
  rangeFactorStart(_: number, slience?: boolean): this;
  rangeFactorStart(_?: number, slience?: boolean): this | any {
    if (!_) {
      return super.rangeFactorStart();
    }
    super.rangeFactorStart(_);
    this._output = this._input = null;

    return this;
  }

  rangeFactorEnd(): number;
  rangeFactorEnd(_: number, slience?: boolean): this;
  rangeFactorEnd(_?: number, slience?: boolean): this | any {
    if (!_) {
      return super.rangeFactorEnd();
    }
    super.rangeFactorEnd(_);
    this._output = this._input = null;

    return this;
  }

  forceAlignDomainRange(): boolean;
  forceAlignDomainRange(enable: boolean): this;
  forceAlignDomainRange(forceAlign?: boolean): this | boolean {
    if (!arguments.length) {
      return this._forceAlign;
    }
    this._forceAlign = forceAlign;
    return this;
  }
}
