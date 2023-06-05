const getType = (value: any): string => {
  return {}.toString
    .call(value)
    .replace(/^\[object /, '')
    .replace(/]$/, '');
};

export default getType;
