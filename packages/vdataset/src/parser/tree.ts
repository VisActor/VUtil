import { isFunction } from '@dp/vis-util';
import { hierarchy } from 'd3-hierarchy';
import type { DataView } from '../data-view';
import { DATAVIEW_TYPE } from '../constants';
import { mergeDeepImmer } from '../utils/js';
import type { Parser } from '.';

export interface ITreeParserOptions {
  children?: (data: any) => any[]; // 指定的 children 访问器会为每个数据进行调用，从根 data 开始，并且必须返回一个数组用以表示当前数据的子节点，返回 null 表示当前数据没有子节点。如果没有指定 children 则默认为: d => d.children
  pureData?: boolean;
}

const DEFAULT_TREE_PARSER_OPTIONS: ITreeParserOptions = {
  children: d => d.children,
  pureData: false
};
/**
 * 树形结构数据 解析器
 * @param data
 * @param options
 * @param dataView
 * @returns
 */
export const treeParser: Parser = (data: any, options: ITreeParserOptions, dataView: DataView) => {
  dataView.type = DATAVIEW_TYPE.TREE;
  const mergeOptions = mergeDeepImmer(DEFAULT_TREE_PARSER_OPTIONS, options);
  const { children } = mergeOptions;

  if (children && !isFunction(children)) {
    throw new TypeError('Invalid children: must be a function!');
  }

  return hierarchy(data, children);
  // // if (!options.pureData) {
  // //   // @ts-ignore
  // //   dataView.rows = dataView.root = hierarchy(data, children);
  // // } else {
  // //   dataView.rows = dataView.root = data;
  // // }
  // return data;
};
