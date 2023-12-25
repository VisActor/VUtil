import { isArray, isNumber } from '../common';
import { RGB } from './RGB';

/**
 * Converts hexadecimal number or decimal number array into RGB
 * like 0xffffff or [255,255,255]
 * @param value
 * @returns instance of RGB
 */
export function rgb(value: number | number[]): RGB {
  if (isNumber(value)) {
    return new RGB((value as number) >> 16, ((value as number) >> 8) & 0xff, (value as number) & 0xff, 1);
  } else if (isArray(value)) {
    return new RGB(value[0], value[1], value[2]);
  }

  // default return
  return new RGB(255, 255, 255);
}

/**
 * Converts hexadecimal number or decimal number array into RGB
 * like 0xffffff00 or [255,255,255,0]
 * @param value
 * @returns instance of RGB
 */
export function rgba(value: number | number[]): RGB {
  if (isNumber(value)) {
    return new RGB(
      (value as number) >>> 24,
      ((value as number) >>> 16) & 0xff,
      ((value as number) >>> 8) & 0xff,
      (value as number) & 0xff
    );
  } else if (isArray(value)) {
    return new RGB(value[0], value[1], value[2], value[3]);
  }
  return new RGB(255, 255, 255, 1);
}
