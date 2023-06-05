import isArray from './isArray';
import isObject from './isObject';

function is(x: any, y: any) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  }
  // eslint-disable-next-line no-self-compare
  return x !== x && y !== y; //  NaN == NaN
}

function length(obj: any) {
  if (isArray(obj)) {
    return obj.length;
  }
  if (isObject(obj)) {
    return Object.keys(obj).length;
  }
  return 0;
}

export function isShallowEqual(objA: any, objB: any) {
  if (is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  if (isArray(objA) !== isArray(objB)) {
    return false;
  }

  if (length(objA) !== length(objB)) {
    return false;
  }

  let ret = true;

  Object.keys(objA).forEach((k: any) => {
    const v = objA[k];

    if (!is(v, objB[k])) {
      ret = false;
      return ret;
    }
    return true;
  });

  return ret;
}
