import isFunction from './isFunction';
import isNil from './isNil';
import isNumber from './isNumber';
/**
 * Return an array with minimum and maximum values, in the
 * form [min, max]. Ignores null, undefined, and NaN values.
 */
export const extent = (array: any[], func?: (val: any) => number) => {
  const valueGetter = isFunction(func) ? func : (val: any) => val;
  let min: number;
  let max: number;

  if (array && array.length) {
    const n = array.length;

    // find first valid value
    for (let i = 0; i < n; i += 1) {
      let value = valueGetter(array[i]);
      if (!isNil(value) && isNumber((value = +value)) && !Number.isNaN(value)) {
        if (isNil(min)) {
          min = value;
          max = value;
        } else {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      }
    }

    return [min, max];
  }

  return [min, max];
};
