import isArray from './isArray';
import isFunction from './isFunction';
import isPlainObject from './isPlainObject';

function objToString(obj: any) {
  return Object.prototype.toString.call(obj);
}

function objectKeys(obj: any) {
  return Object.keys(obj);
}

// Adapted from https://github.com/antvis/F2/blob/master/packages/f2/src/base/equal.ts by zengyue
// License: https://github.com/antvis/F2/blob/master/packages/f2/LICENSE
export function isEqual(a: any, b: any, options?: { skipFunction?: boolean }): boolean {
  if (a === b) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  // null 和 undefined
  if (a == null || b == null) {
    return false;
  }

  // 特殊处理NaN
  if (Number.isNaN(a) && Number.isNaN(b)) {
    return true;
  }

  if (objToString(a) !== objToString(b)) {
    return false;
  }

  // 如果是function，则不相等
  if (isFunction(a)) {
    return !!options?.skipFunction;
  }

  // 值类型，Number String Boolean
  if (typeof a !== 'object') {
    return false;
  }

  if (isArray(a)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = a.length - 1; i >= 0; i--) {
      if (!isEqual(a[i], b[i], options)) {
        return false;
      }
    }
    return true;
  }

  if (!isPlainObject(a)) {
    return false;
  }

  const ka = objectKeys(a);
  const kb = objectKeys(b);
  // having the same number of owned properties (keys incorporates hasOwnProperty)
  if (ka.length !== kb.length) {
    return false;
  }

  // the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  // ~~~cheap key test
  for (let i = ka.length - 1; i >= 0; i--) {
    // eslint-disable-next-line eqeqeq
    if (ka[i] != kb[i]) {
      return false;
    }
  }

  // equivalent values for every corresponding key, and ~~~possibly expensive deep test
  for (let i = ka.length - 1; i >= 0; i--) {
    const key = ka[i];
    if (!isEqual(a[key], b[key], options)) {
      return false;
    }
  }

  return true;
}
