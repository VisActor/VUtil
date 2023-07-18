/**
 * check value type
 * @param value the value to check
 * @param type type
 * @returns
 */
const isType = (value: any, type: string): boolean => Object.prototype.toString.call(value) === `[object ${type}]`;

export default isType;
