import { ScaleEnum } from './type';
import { BandScale } from './band-scale';
import type { DiscreteScaleType, IBandLikeScale } from './interface';

export class PointScale extends BandScale implements IBandLikeScale {
  readonly type: DiscreteScaleType = ScaleEnum.Point;
  protected _padding = 0;

  constructor(slience?: boolean) {
    super(false);
    this.paddingInner(1, slience);
    this.padding = this.paddingOuter;
    this.paddingInner = undefined;
    this.paddingOuter = undefined;
  }
}
