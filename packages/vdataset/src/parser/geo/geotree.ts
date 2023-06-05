// import getPointAtLength from 'point-at-length';
// import { geoPath } from 'd3-geo';
import { cloneDeep } from '@dp/vis-util';
import { DATAVIEW_TYPE } from '../../constants';
import type { DataView } from '../../data-view';
import type { Parser } from '..';

// const geoPathGenerator = geoPath();

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IGeoTreeOptions {
  // nothing
}

type TreeID = string;

type GeoTree = {
  parent: TreeID;
  treeID: TreeID;
  name: string;
  treeName: string;
  payload: any;
  children: any;
  version: any;
};

// parent	null
// treeID	"1"
// name	"江浙沪包邮区"
// treeName	"江浙沪包邮区_1"
// payload	{…}
// children	{…}
// version	"1.0.0"

/**
 * WIP: 解析GeoTree
 * @param data
 * @param _options
 * @param dataView
 * @returns
 */
export const GeoTreeParser: Parser = (data: GeoTree, options: IGeoTreeOptions = {}, dataView: DataView) => {
  dataView.type = DATAVIEW_TYPE.GEO;
  return cloneDeep(data);
};
