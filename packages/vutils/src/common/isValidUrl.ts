export const isValidUrl = (value: string) => {
  // TODO: 匹配其他形式的 url
  const exp = /^(http(s)?:\/\/)\w+[^\s]+(\.[^\s]+){1,}$/;
  const urlPattern = new RegExp(exp);
  return urlPattern.test(value);
};

export default isValidUrl;
