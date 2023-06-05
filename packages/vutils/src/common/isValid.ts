const isValid = <T>(value: T): value is NonNullable<T> => {
  return value !== null && value !== undefined;
};

export default isValid;
