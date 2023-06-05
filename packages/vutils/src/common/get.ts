import type { Dict } from '../type';
import isString from './isString';

const get = (obj: Dict<any>, path: string | string[], defaultValue?: any): any => {
  const paths = isString(path) ? (path as string).split('.') : path;

  for (let p = 0; p < paths.length; p++) {
    obj = obj ? obj[paths[p]] : undefined;
  }
  return obj === undefined ? defaultValue : obj;
};

export default get;
