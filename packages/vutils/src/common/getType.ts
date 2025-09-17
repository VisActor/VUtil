const getType = (value: any): string => {
  return Object.prototype.toString.call(value).slice(8, -1);
};

export default getType;
