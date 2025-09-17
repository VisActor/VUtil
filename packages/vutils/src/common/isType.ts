/**
 * check value type
 * @param value the value to check
 * @param type type
 * @returns
 */
import getType from './getType';

const isType = (value: any, type: string): boolean => getType(value) === type;

export default isType;
