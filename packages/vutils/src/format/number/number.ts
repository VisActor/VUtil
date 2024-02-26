/* Adapted from d3-time-format by Mike Bostock
 * https://github.com/d3/d3-format
 * Licensed under the ISC

 * License: https://github.com/d3/d3-format/blob/main/LICENSE
 * @license
 */

import { formatDecimal, formatDecimalParts } from './formatDecimal';
import { formatGroup } from './formatGroup';
import { formatPrefixAuto, prefixExponent } from './formatPrefixAuto';
import { formatRounded } from './formatRounded';
import { formatTrim } from './formatTrim';
import { formatSpecifier } from './specifier';

export interface FormatLocale {
  thousands: string;
  grouping: number[];
  currency: [string, string];
  numerals?: string[] | undefined;
  percent?: string | undefined;
  minus?: string | undefined;
  nan?: string | undefined;
  decimal?: string;
}

const prefixes = ['y', 'z', 'a', 'f', 'p', 'n', 'µ', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

export class NumberUtil {
  private locale: FormatLocale = {
    thousands: ',',
    grouping: [3],
    currency: ['$', '']
  };

  private group =
    this.locale.grouping === undefined || this.locale.thousands === undefined
      ? (group: any) => group
      : formatGroup([...this.locale.grouping].map(Number), `${this.locale.thousands}`);
  private currencyPrefix = this.locale.currency === undefined ? '' : this.locale.currency[0] + '';
  private currencySuffix = this.locale.currency === undefined ? '' : this.locale.currency[1] + '';
  private decimal = this.locale.decimal === undefined ? '.' : this.locale.decimal + '';
  private numerals =
    this.locale.numerals === undefined
      ? (numerals: any) => numerals
      : formatNumerals([...this.locale.numerals].map(String));
  private percent = this.locale.percent === undefined ? '%' : this.locale.percent + '';
  private minus = this.locale.minus === undefined ? '−' : this.locale.minus + '';
  private nan = this.locale.nan === undefined ? 'NaN' : this.locale.nan + '';

  private static instance: NumberUtil;

  static getInstance(): NumberUtil {
    if (!NumberUtil.instance) {
      NumberUtil.instance = new NumberUtil();
    }
    return NumberUtil.instance;
  }

  private newFormat(specifier: string) {
    const specifierIns = formatSpecifier(specifier);

    let fill = specifierIns.fill;
    let align = specifierIns.align;
    const sign = specifierIns.sign;
    const symbol = specifierIns.symbol;
    let zero = specifierIns.zero;
    const width = specifierIns.width;
    let comma = specifierIns.comma;
    let precision = specifierIns.precision;
    let trim = specifierIns.trim;
    let type = specifierIns.type;

    // The "n" type is an alias for ",g".
    if (type === 'n') {
      (comma = true), (type = 'g');
    }
    // The "" type, and any invalid type, is an alias for ".12~g".
    // @ts-ignore
    else if (!formatTypes[type]) {
      precision === undefined && (precision = 12), (trim = true), (type = 'g');
    }

    // If zero fill is specified, padding goes after sign and before digits.
    // @ts-ignore
    if (zero || (fill === '0' && align === '=')) {
      (zero = true), (fill = '0'), (align = '=');
    }

    // Compute the prefix and suffix.
    // For SI-prefix, the suffix is lazily computed.
    const prefix =
      symbol === '$' ? this.currencyPrefix : symbol === '#' && /[boxX]/.test(type) ? '0' + type.toLowerCase() : '';
    const suffix = symbol === '$' ? this.currencySuffix : /[%p]/.test(type) ? this.percent : '';

    // What format function should we use?
    // Is this an integer type?
    // Can this type generate exponential notation?
    const formatType = formatTypes[type];
    const maybeSuffix = /[defgprstz%]/.test(type);

    // Set the default precision if not specified,
    // or clamp the specified precision to the supported range.
    // For significant precision, it must be in [1, 21].
    // For fixed precision, it must be in [0, 20].
    precision =
      precision === undefined
        ? 6
        : /[gprs]/.test(type)
        ? Math.max(1, Math.min(21, precision))
        : Math.max(0, Math.min(20, precision));

    const { nan, minus, decimal, group, numerals } = this;

    function format(value: number) {
      let valuePrefix = prefix;
      let valueSuffix = suffix;
      let i;
      let n;
      let c;
      let _value: any = value;

      if (type === 'c') {
        valueSuffix = formatType(_value) + valueSuffix;
        _value = '';
      } else {
        _value = +_value;

        // Determine the sign. -0 is not less than 0, but 1 / -0 is!
        let valueNegative = _value < 0 || 1 / _value < 0;

        // Perform the initial formatting.
        _value = isNaN(_value) ? nan : formatType(Math.abs(_value), precision);

        // Trim insignificant zeros.
        if (trim) {
          _value = formatTrim(_value);
        }

        // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
        if (valueNegative && +_value === 0 && sign !== '+') {
          valueNegative = false;
        }

        // Compute the prefix and suffix.
        valuePrefix =
          (valueNegative ? (sign === '(' ? sign : minus) : sign === '-' || sign === '(' ? '' : sign) + valuePrefix;
        valueSuffix =
          (type === 's' ? prefixes[8 + prefixExponent / 3] : '') +
          valueSuffix +
          (valueNegative && sign === '(' ? ')' : '');

        // Break the formatted value into the integer “value” part that can be
        // grouped, and fractional or exponential “suffix” part that is not.
        if (maybeSuffix) {
          (i = -1), (n = _value.length);
          while (++i < n) {
            if (((c = _value.charCodeAt(i)), 48 > c || c > 57)) {
              valueSuffix = (c === 46 ? decimal + _value.slice(i + 1) : _value.slice(i)) + valueSuffix;
              _value = _value.slice(0, i);
              break;
            }
          }
        }
      }

      // If the fill character is not "0", grouping is applied before padding.
      if (comma && !zero) {
        _value = group(_value, Infinity);
      }

      // Compute the padding.
      let length = valuePrefix.length + _value.length + valueSuffix.length;
      let padding = length < width ? new Array(width - length + 1).join(fill) : '';

      // If the fill character is "0", grouping is applied after padding.
      if (comma && zero) {
        _value = group(padding + _value, padding.length ? width - valueSuffix.length : Infinity);
        padding = '';
      }

      // Reconstruct the final output based on the desired alignment.
      switch (align) {
        case '<':
          _value = valuePrefix + _value + valueSuffix + padding;
          break;
        case '=':
          _value = valuePrefix + padding + _value + valueSuffix;
          break;
        case '^':
          _value =
            padding.slice(0, (length = padding.length >> 1)) +
            valuePrefix +
            _value +
            valueSuffix +
            padding.slice(length);
          break;
        default:
          _value = padding + valuePrefix + _value + valueSuffix;
          break;
      }
      return numerals(_value);
    }

    format.toString = function () {
      return specifier + '';
    };

    return format;
  }

  private _formatPrefix(specifier: string, value: number) {
    const _specifier = formatSpecifier(specifier);
    _specifier.type = 'f';
    const f = this.newFormat(_specifier.toString());
    const e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3;
    const k = Math.pow(10, -e);
    const prefix = prefixes[8 + e / 3];
    return function (value: number) {
      return f(k * value) + prefix;
    };
  }

  formatter = (specifier: string) => {
    return this.newFormat(specifier);
  };

  format = (specifier: string, value: number) => {
    return this.formatter(specifier)(value);
  };

  formatPrefix = (specifier: string, value: number) => {
    return this._formatPrefix(specifier, value);
  };
}

export const formatTypes = {
  '%': (x: number, p: number) => (x * 100).toFixed(p),
  b: (x: number) => Math.round(x).toString(2),
  c: (x: number) => x + '',
  d: formatDecimal,
  f: (x: number, p: number) => x.toFixed(p),
  e: (x: number, p: number) => x.toExponential(p),
  g: (x: number, p: number) => x.toPrecision(p),
  o: (x: number) => Math.round(x).toString(8),
  p: (x: number, p: number) => formatRounded(x * 100, p),
  r: formatRounded,
  s: formatPrefixAuto,
  X: (x: number) => Math.round(x).toString(16).toUpperCase(),
  x: (x: number) => Math.round(x).toString(16),
  t: (x: number, p: number) => {
    // 判断是否为整数
    if (Number.isInteger(x)) {
      return x.toFixed(2);
    }
    return Math.floor(x * Math.pow(10, p)) / Math.pow(10, p) + '';
  },
  z: (x: number, p: number) => (x % 1 === 0 ? x + '' : x.toFixed(p))
};

export function exponent(x: number) {
  const _x = formatDecimalParts(Math.abs(x));
  return _x ? _x[1] : NaN;
}

export function formatNumerals(numerals: string[]) {
  return function (value: string) {
    return value.replace(/[0-9]/g, (i: string) => numerals[+i]);
  };
}
