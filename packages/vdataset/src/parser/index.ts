import type { DataView } from '../data-view';

/**
 * Parser 类型
 */
export type Parser = (data: any, options: any, dataView: DataView) => any;

type ParserName = string;

export interface IParserOptions {
  type: ParserName;
  clone?: boolean;
  options?: any;
  layerType?: string;
}
