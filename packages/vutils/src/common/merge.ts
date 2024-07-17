import isArray from './isArray';
import isArrayLike from './isArrayLike';
import isPlainObject from './isPlainObject';
import isValid from './isValid';

export function baseMerge(target: any, source: any, shallowArray: boolean = false, skipTargetArray: boolean = false) {
  if (source) {
    if (target === source) {
      return;
    }
    if (isValid(source) && typeof source === 'object') {
      // baseFor
      const iterable = Object(source);
      const props = [];
      // keysIn
      for (const key in iterable) {
        props.push(key);
      }
      let { length } = props;
      let propIndex = -1;
      while (length--) {
        const key = props[++propIndex];
        // skipArray 这个是vchart spec的特有逻辑
        if (
          isValid(iterable[key]) &&
          typeof iterable[key] === 'object' &&
          (!skipTargetArray || !isArray(target[key]))
        ) {
          baseMergeDeep(target, source, key, shallowArray, skipTargetArray);
        } else {
          assignMergeValue(target, key, iterable[key]);
        }
      }
    }
  }
}

// 由于目前 ChartSpace 内部对 spec 会先执行一次深拷贝，merge 暂时不考虑 source 中有环的问题
// eslint-disable-next-line @typescript-eslint/ban-types
function baseMergeDeep(
  target: object,
  source: object,
  key: string,
  shallowArray: boolean = false,
  skipTargetArray: boolean = false
) {
  const objValue = target[key];
  const srcValue = source[key];
  let newValue = source[key];
  let isCommon = true;
  // 不考虑 buffer / typedArray 类型
  if (isArray(srcValue)) {
    if (shallowArray) {
      // 依据参数对数组做浅拷贝
      newValue = [];
    } else if (isArray(objValue)) {
      newValue = objValue;
    } else if (isArrayLike(objValue)) {
      // 如果 source 为数组，则 target 的 arrayLike 对象也视作为数组处理
      newValue = new Array(objValue.length);
      let index = -1;
      const length = objValue.length;
      while (++index < length) {
        newValue[index] = objValue[index];
      }
    }
  }
  // else if (isArray(srcValue) && shallowArray) {
  //   newValue = [];
  // }
  // 不考虑 argument 类型
  else if (isPlainObject(srcValue)) {
    newValue = objValue;
    // 不考虑 prototype 的额外处理
    if (typeof objValue === 'function' || typeof objValue !== 'object') {
      newValue = {};
    }
  } else {
    isCommon = false;
  }
  // 对 class 等复杂对象或者浅拷贝的 array 不做拷贝处理
  if (isCommon) {
    baseMerge(newValue, srcValue, shallowArray, skipTargetArray);
  }
  assignMergeValue(target, key, newValue);
}

// eslint-disable-next-line @typescript-eslint/ban-types
function assignMergeValue(target: object, key: string, value: any) {
  if ((value !== undefined && !eq(target[key], value)) || (value === undefined && !(key in target))) {
    // 不考虑 __proto__ 的赋值处理
    target[key] = value;
  }
}

function eq(value: any, other: any) {
  return value === other || (Number.isNaN(value) && Number.isNaN(other));
}

// 与原生的 lodash merge 差异在于对数组是否应用最后一个 source 的结果
// 例如 lineDash 等 spec 的 merge 使用这一操作更合适
export default function merge(target: any, ...sources: any[]): any {
  let sourceIndex = -1;
  const length = sources.length;
  while (++sourceIndex < length) {
    const source = sources[sourceIndex];
    baseMerge(target, source, true);
  }
  return target;
}
