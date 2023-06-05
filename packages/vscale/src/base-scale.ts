import type { IRangeFactor } from './interface';

export abstract class BaseScale implements IRangeFactor {
  protected _wholeRange: any[];
  protected _rangeFactor?: number[];
  protected _unknown: any;

  abstract range(): any[];
  abstract domain(): any[];
  abstract invert(d: any): any;

  protected _calculateRange(range: any[]) {
    if (this._wholeRange) {
      return this._wholeRange;
    }

    if (this._rangeFactor && range.length === 2) {
      const k = (range[1] - range[0]) / (this._rangeFactor[1] - this._rangeFactor[0]);
      const b = range[0] - k * this._rangeFactor[0];
      const r0 = b;
      const r1 = k + b;
      this._wholeRange = [r0, r1];

      return this._wholeRange;
    }
    return range;
  }

  calculateVisibleDomain(range: any[]) {
    if (this._rangeFactor && range.length === 2) {
      const d0 = this.invert(range[0]);
      const d1 = this.invert(range[1]);

      return [d0, d1];
    }

    return this.domain();
  }

  rangeFactor(): [number, number];
  rangeFactor(_: [number, number], slience?: boolean): this;
  rangeFactor(_?: [number, number], slience?: boolean): this | any[] {
    if (!_) {
      return this._rangeFactor;
    }
    if (_.length === 2 && _.every(r => r >= 0 && r <= 1)) {
      this._wholeRange = null;
      this._rangeFactor = _;
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
