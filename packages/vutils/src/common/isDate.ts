import isType from './isType';

const isDate = (value: any): value is Date => {
  return isType(value, 'Date');
};

export default isDate;
