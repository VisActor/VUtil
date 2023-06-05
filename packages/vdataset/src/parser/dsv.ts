import { dsvFormat, csvParse, tsvParse } from 'd3-dsv';
import { isString } from '@visactor/vutils';
import { DATAVIEW_TYPE } from '../constants';
import type { DataView } from '../data-view';
import { mergeDeepImmer } from '../utils/js';
import type { Parser } from '.';

export interface IDsvParserOptions {
  delimiter?: string; // delimiter 必须是一个单字符
}

const DEFAULT_DSV_PARSER_OPTIONS = {
  delimiter: ',' // delimiter参数值默认为半角逗号，即默认将被处理文件视为CSV,当delimiter='\t'时，被处理文件就是TSV。
};

/**
 * 根据指定的 delimiter 构造一个新的 DSV(支持范式的分隔符分隔值文件，delimiter-separated values)解析以及格式化。
 * @param data
 * @param options
 * @returns
 */
export const dsvParser: Parser = (data: string, options: IDsvParserOptions = {}, dataView: DataView) => {
  dataView.type = DATAVIEW_TYPE.DSV;

  const mergeOptions = mergeDeepImmer(DEFAULT_DSV_PARSER_OPTIONS, options) as IDsvParserOptions;

  const { delimiter } = mergeOptions;
  if (!isString(delimiter)) {
    throw new TypeError('Invalid delimiter: must be a string!');
  }
  return dsvFormat(delimiter).parse(data);
};

/**
 * 解析指定的 CSV 字符串并返回对象数组
 * @param data
 * @returns
 */
export const csvParser: Parser = (data: string, options: IDsvParserOptions = {}, dataView: DataView) => {
  dataView.type = DATAVIEW_TYPE.DSV;
  return csvParse(data);
};

/**
 * 解析指定的 TSV 字符串并返回对象数组
 * @param data
 * @returns
 */
export const tsvParser: Parser = (data: string, options: IDsvParserOptions = {}, dataView: DataView) => {
  dataView.type = DATAVIEW_TYPE.DSV;
  return tsvParse(data);
};
