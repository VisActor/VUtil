import isPlainObject from './isPlainObject';
import isString from './isString';

export default function pickWithout<T extends Record<string, any>>(obj: T, keys: (string | RegExp)[]): Partial<T> {
  if (!obj || !isPlainObject(obj)) {
    return obj;
  }
  const result = {};

  Object.keys(obj).forEach((k: string) => {
    const v = obj[k];

    let match = false;

    keys.forEach(itKey => {
      if (isString(itKey) && itKey === k) {
        match = true;
      } else if (itKey instanceof RegExp && k.match(itKey)) {
        match = true;
      }
    });

    if (!match) {
      result[k] = v;
    }
  });

  return result as Partial<T>;
}
