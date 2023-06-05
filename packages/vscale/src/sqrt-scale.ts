import { sqrt, square } from './utils/utils';
import { LinearScale } from './linear-scale';
import { ScaleEnum } from './type';
import type { ContinuousScaleType } from './interface';

export class SqrtScale extends LinearScale {
  readonly type: ContinuousScaleType = ScaleEnum.Sqrt;

  constructor() {
    super(sqrt, square);
  }

  clone(): SqrtScale {
    return new SqrtScale()
      .domain(this._domain, true)
      .range(this._range, true)
      .unknown(this._unknown)
      .clamp(this.clamp(), null, true)
      .interpolate(this._interpolate) as LinearScale;
  }
}
