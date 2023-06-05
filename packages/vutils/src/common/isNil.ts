const isNil = (value: any): value is null | undefined => {
  return value === null || value === undefined;
};

export default isNil;
