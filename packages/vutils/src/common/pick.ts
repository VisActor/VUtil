import isPlainObject from './isPlainObject';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export default function pick<T, U extends keyof T>(obj: T, keys: Array<U>): Pick<T, U> {
  if (!obj || !isPlainObject(obj)) {
    return obj;
  }
  const result = {} as Pick<T, U>;
  keys.forEach(k => {
    if (hasOwnProperty.call(obj, k)) {
      result[k] = obj[k];
    }
  });
  return result;
}
