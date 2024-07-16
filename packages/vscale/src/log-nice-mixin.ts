import type { NiceOptions, NiceType } from './interface';
import { parseNiceOptions } from './utils/tick-sample';
import { nice } from './utils/utils';

export class LogNiceMixin {
  protected _domain: number[];
  protected _domainValidator?: (val: number) => boolean;
  protected _niceDomain: number[];

  nice(count: number = 10, option?: NiceOptions): this {
    const originalDomain = this._domain;
    let niceMinMax: number[] = [];
    let niceType: NiceType = null;

    if (option) {
      const res = parseNiceOptions(originalDomain, option);
      niceMinMax = res.niceMinMax;
      this._domainValidator = res.domainValidator;

      niceType = res.niceType;

      if (res.niceDomain) {
        this._niceDomain = res.niceDomain;
        (this as any).rescale();
        return this;
      }
    } else {
      niceType = 'all';
    }

    if (niceType) {
      const niceDomain = nice(
        originalDomain.slice(),
        (this as any).getNiceConfig?.() ?? {
          floor: (x: number) => Math.floor(x),
          ceil: (x: number) => Math.ceil(x)
        }
      );

      if (niceType === 'min') {
        niceDomain[niceDomain.length - 1] = niceMinMax[1] ?? niceDomain[niceDomain.length - 1];
      } else if (niceType === 'max') {
        niceDomain[0] = niceMinMax[0] ?? niceDomain[0];
      }

      this._niceDomain = niceDomain as number[];
      (this as any).rescale();
      return this;
    }

    return this;
  }

  /**
   * 只对min区间进行nice
   * 如果保持某一边界的值，就很难有好的nice效果，所以这里实现就是nice之后还原固定的边界值
   */
  niceMin(): this {
    const maxD = this._domain[this._domain.length - 1];
    this.nice();
    const niceDomain = this._domain.slice();

    if (this._domain) {
      niceDomain[niceDomain.length - 1] = maxD;
      this._niceDomain = niceDomain;
      (this as any).rescale();
    }

    return this;
  }

  /**
   * 只对max区间进行nice
   * 如果保持某一边界的值，就很难有好的nice效果，所以这里实现就是nice之后还原固定的边界值
   */
  niceMax(): this {
    const minD = this._domain[0];
    this.nice();
    const niceDomain = this._domain.slice();

    if (this._domain) {
      niceDomain[0] = minD;
      this._niceDomain = niceDomain;
      (this as any).rescale();
    }

    return this;
  }
}
