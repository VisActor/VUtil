const isArrayLike = function (value: any): boolean {
  return value !== null && typeof value !== 'function' && Number.isFinite(value.length);
};

export default isArrayLike;
