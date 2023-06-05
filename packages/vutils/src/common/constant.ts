import isFunction from './isFunction';

const constant = (value: any) => {
  return isFunction(value)
    ? value
    : () => {
        return value;
      };
};

export default constant;
