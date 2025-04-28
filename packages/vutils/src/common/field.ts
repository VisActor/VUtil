import get from './get';
import isArray from './isArray';
import isFunction from './isFunction';

/** 获取字段值的函数 */
export type FieldGetterFunction = (val: any) => any;

/** 根据字段路径，返回获取相应路径属性的函数 */
export type Getter = (path: string[]) => FieldGetterFunction;

export type FieldOption = { field: string };
export type TagItemAttribute<T> = T | ((d?: any) => T);

/** field函数对应的参数 */
export interface FieldGetterGeneratorOptions {
  get?: Getter;
}

export const getter = (path: string[]): any => {
  return (obj: any) => get(obj, path);
};

const fieldSingle = (fieldStr: string | FieldGetterFunction, opt: FieldGetterGeneratorOptions = {}) => {
  if (isFunction(fieldStr)) {
    return fieldStr;
  }

  const path = [fieldStr];

  return ((opt && opt.get) || getter)(path);
};

export const field = (
  fieldStr: string | string[] | FieldGetterFunction | FieldGetterFunction[],
  opt: FieldGetterGeneratorOptions = {}
) => {
  if (isArray(fieldStr)) {
    const funcs = fieldStr.map(entry => fieldSingle(entry, opt));

    return (datum: any) => {
      return funcs.map(func => func(datum));
    };
  }

  return fieldSingle(fieldStr, opt);
};

/**
 * 取数逻辑
 */
export const simpleField = <T>(option: FieldOption | TagItemAttribute<T>) => {
  if (!option) {
    return null;
  }
  if (typeof option === 'string' || typeof option === 'number') {
    return () => option;
  } else if (isFunction(option)) {
    return option as (datum: any) => T;
  }
  return (datum: any) => datum[(option as FieldOption).field];
};
