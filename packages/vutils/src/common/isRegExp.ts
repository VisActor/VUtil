import isType from './isType';

const isRegExp = (value: any): value is RegExp => {
  return isType(value, 'RegExp');
};

export default isRegExp;
