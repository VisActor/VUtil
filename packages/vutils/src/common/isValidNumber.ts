import isNumber from './isNumber';

const isValidNumber = (value: any): value is number => {
  // isFinate 包含来 isNaN 的判断
  return isNumber(value) && Number.isFinite(value);
};

export default isValidNumber;
