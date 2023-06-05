import isValidNumber from './common/isValidNumber';
import isArray from './common/isArray';
import isObject from './common/isObject';

export type IPadding = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

/**
 * 将 padding 转换为通用的格式（[上，右，下，左]）
 * @param padding
 * @return [ top, right, bottom, left ]
 */
export function normalizePadding(padding: number | number[] | IPadding) {
  if (isValidNumber(padding)) {
    return [padding, padding, padding, padding];
  }

  if (isArray(padding)) {
    const length = padding.length;

    if (length === 1) {
      const paddingValue = padding[0];
      return [paddingValue, paddingValue, paddingValue, paddingValue];
    }

    if (length === 2) {
      const [vertical, horizontal] = padding;
      return [vertical, horizontal, vertical, horizontal];
    }

    if (length === 3) {
      const [top, horizontal, bottom] = padding;
      return [top, horizontal, bottom, horizontal];
    }

    if (length === 4) {
      return padding;
    }
  }

  if (isObject(padding)) {
    const { top = 0, right = 0, bottom = 0, left = 0 } = padding as IPadding;
    return [top, right, bottom, left];
  }

  return [0, 0, 0, 0];
}
