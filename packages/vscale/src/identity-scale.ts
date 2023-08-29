import { ScaleEnum } from './type';
import type { IBaseScale } from './interface';

export const implicit = Symbol('implicit');

export class IdentityScale implements IBaseScale {
  readonly type = ScaleEnum.Identity;
  protected _domain: Array<any>;
  protected _unknown: any;

  /** specified: support scale to return specific value on special input value */
  protected _specified: Record<string, unknown>;
  specified(): Record<string, unknown>;
  specified(_: Record<string, unknown>): this;
  specified(_?: Record<string, unknown>): this | Record<string, unknown> {
    if (!_) {
      return Object.assign({}, this._specified);
    }
    this._specified = Object.assign(this._specified ?? {}, _);
    return this;
  }

  protected _getSpecifiedValue(input: string): undefined | any {
    if (!this._specified) {
      return undefined;
    }
    return this._specified[input];
  }

  // TODO checkPoint
  clone(): IBaseScale {
    return new IdentityScale().unknown(this._unknown).domain(this._domain).specified(this._specified);
  }

  scale(d: any): any {
    const key = `${d}`;
    const special = this._getSpecifiedValue(key);
    if (special !== undefined) {
      return special;
    }

    if (this._unknown !== implicit && this._domain && !this._domain.includes(d)) {
      return this._unknown;
    }

    return d;
  }

  invert(d: any): any {
    return d;
  }

  domain(): any[];
  domain(_: any[]): this;
  domain(_?: any[]): this | any {
    if (!_) {
      return this._domain ? this._domain.slice() : undefined;
    }
    this._domain = _;

    return this;
  }

  range(): any[];
  range(_: any[]): this;
  range(_?: any[]): this | any {
    if (!_) {
      return undefined;
    }

    return this;
  }

  unknown(): any[];
  unknown(_: any): this;
  unknown(_?: any): this | any {
    if (!arguments.length) {
      return this._unknown;
    }
    this._unknown = _;
    return this;
  }
}
