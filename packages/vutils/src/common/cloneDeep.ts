import isArray from './isArray';
import isBoolean from './isBoolean';
import isDate from './isDate';
import isNumber from './isNumber';
import isString from './isString';
import isValid from './isValid';

export default function cloneDeep(value: any, ignoreWhen?: (value: any) => boolean, excludeKeys?: string[]): any {
  let result;
  if (!isValid(value) || typeof value !== 'object' || (ignoreWhen && ignoreWhen(value))) {
    return value;
  }

  const isArr = isArray(value);
  const length = value.length;
  // 不考虑特殊数组的额外处理
  if (isArr) {
    result = new Array(length);
  }
  // 不考虑 buffer / arguments 类型的处理以及 prototype 的额外处理
  else if (typeof value === 'object') {
    result = {};
  }
  // 不建议使用作为 Boolean / Number / String 作为构造器
  else if (isBoolean(value) || isNumber(value) || isString(value)) {
    result = value;
  } else if (isDate(value)) {
    result = new Date(+value);
  }
  // 不考虑 ArrayBuffer / DataView / TypedArray / map / set / regexp / symbol 类型
  else {
    result = undefined;
  }

  // 不考虑 map / set / TypedArray 类型的赋值

  // 不考虑对象的 symbol 属性
  const props = isArr ? undefined : Object.keys(Object(value));

  let index = -1;
  if (result) {
    while (++index < (props || value).length) {
      const key = props ? props[index] : index;
      const subValue = value[key];

      if (excludeKeys && excludeKeys.includes(key.toString())) {
        result[key] = subValue;
      } else {
        result[key] = cloneDeep(subValue, ignoreWhen, excludeKeys);
      }
    }
  }
  return result;
}
