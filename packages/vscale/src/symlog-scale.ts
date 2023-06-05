import type { ContinuousScaleType } from './interface';
import { LinearScale } from './linear-scale';
import { ScaleEnum } from './type';
import { symlog, symexp } from './utils/utils';

export class SymlogScale extends LinearScale {
  readonly type: ContinuousScaleType = ScaleEnum.Symlog;

  _const: number;

  constructor() {
    super(symlog(1), symexp(1));
    this._const = 1;
  }

  clone(): SymlogScale {
    return new SymlogScale()
      .domain(this._domain, true)
      .range(this._range, true)
      .unknown(this._unknown)
      .clamp(this.clamp(), null, true)
      .interpolate(this._interpolate, true)
      .constant(this._const) as SymlogScale;
  }

  constant(): number;
  constant(_: number, slience?: boolean): this;
  constant(_?: number, slience?: boolean): this | number {
    if (!arguments.length) {
      return this._const;
    }

    this._const = _;
    this.transformer = symlog(_);
    this.untransformer = symexp(_);

    return this.rescale(slience);
  }
}
