import isType from './isType';

const isArray = (value: any): value is Array<any> => {
  return Array.isArray ? Array.isArray(value) : isType(value, 'Array');
};

export default isArray;
