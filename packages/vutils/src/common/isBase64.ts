/**
 * 迁移至 sirius
 * Checks if `value` is classified as a `Base64` string;
 * @param {string} The value to check.
 * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
 */
const isBase64 = (value: string): boolean => {
  const exp = /^data:image\/(?:gif|png|jpeg|bmp|webp|svg\+xml)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/g;
  const urlPattern = new RegExp(exp);
  return urlPattern.test(value);
};

export default isBase64;
