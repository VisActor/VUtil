import isValidNumber from './isValidNumber';

export function toValidNumber(v: any) {
  if (isValidNumber(v)) {
    return v;
  }
  const value = +v;
  return isValidNumber(value) ? value : 0;
}
