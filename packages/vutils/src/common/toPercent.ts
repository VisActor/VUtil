import isNil from './isNil';
import isString from './isString';

export const toPercent = (percent: string | number, total: number) => {
  if (isNil(percent)) {
    return total;
  }

  return isString(percent) ? (total * parseFloat(percent as string)) / 100 : percent;
};
