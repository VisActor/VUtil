/* eslint-disable @typescript-eslint/ban-types */
import { cloneDeep, isObject } from '@visactor/vutils';

/**
 * 深拷贝
 * @param target 目标对象
 * @param sources 来源对象
 * @returns
 */
export const mergeDeepImmer = function (target: Object, ...sources: Array<Object>) {
  return mergeOption(cloneDeep(target), ...sources);
};

function _mergeOptionDeep(target: Object, source: Object, key: string) {
  const sourceValue = source[key];
  if (sourceValue === undefined) {
    target[key] = null; // undefined 转为 null 并且也覆盖
  } else if (isObject(sourceValue)) {
    if (!isObject(target[key])) {
      target[key] = {};
    }
    for (const _key in sourceValue) {
      _mergeOptionDeep(target[key], sourceValue, _key);
    }
  } else {
    // 其余类型全部替换
    target[key] = sourceValue;
  }
}

function _mergeOptionBase(target: Object, source: Object) {
  if (!isObject(source)) {
    return;
  }
  if (target === source) {
    return;
  }
  // keysIn
  for (const key in source) {
    _mergeOptionDeep(target, source, key);
  }
}

function mergeOption(target: Object, ...sources: Array<Object>): any {
  if (!target) {
    target = {};
  }
  let sourceIndex = -1;
  const length = sources.length;
  while (++sourceIndex < length) {
    const source = sources[sourceIndex];
    _mergeOptionBase(target, source);
  }
  return target;
}
