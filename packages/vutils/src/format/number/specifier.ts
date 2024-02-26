import { Logger } from '../../logger';

export interface IFormatSpecifier {
  fill?: string | undefined;
  align?: string | undefined;
  sign?: string | undefined;
  symbol?: string | undefined;
  zero?: string | undefined;
  width?: string | undefined;
  comma?: string | undefined;
  precision?: string | undefined;
  trim?: string | undefined;
  type?: string | undefined;
}

export class FormatSpecifier {
  fill;
  align;
  sign;
  symbol;
  zero;
  width;
  comma;
  precision;
  trim;
  type;

  constructor(specifier: IFormatSpecifier = {}) {
    this.fill = specifier.fill === undefined ? ' ' : specifier.fill + '';
    this.align = specifier.align === undefined ? '>' : specifier.align + '';
    this.sign = specifier.sign === undefined ? '-' : specifier.sign + '';
    this.symbol = specifier.symbol === undefined ? '' : specifier.symbol + '';
    this.zero = !!specifier.zero;
    this.width = specifier.width === undefined ? undefined : +specifier.width;
    this.comma = !!specifier.comma;
    this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
    this.trim = !!specifier.trim;
    this.type = specifier.type === undefined ? '' : specifier.type + '';
  }

  toString() {
    return (
      this.fill +
      this.align +
      this.sign +
      this.symbol +
      (this.zero ? '0' : '') +
      (this.width === undefined ? '' : Math.max(1, this.width | 0)) +
      (this.comma ? ',' : '') +
      (this.precision === undefined ? '' : '.' + Math.max(0, this.precision | 0)) +
      (this.trim ? '~' : '') +
      this.type
    );
  }
}

export const numberSpecifierReg = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

export function formatSpecifier(specifier: string) {
  let match;
  if (!(match = numberSpecifierReg.exec(specifier))) {
    Logger.getInstance().error('invalid format: ' + specifier);
    return;
  }
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}
