export enum DATAVIEW_TYPE {
  DSV = 'dsv',
  TREE = 'tree',
  GEO = 'geo',
  BYTE = 'bytejson',
  HEX = 'hex',
  GRAPH = 'graph',
  TABLE = 'table',
  GEO_GRATICULE = 'geo-graticule' // 网格地球
}

export const STATISTICS_METHODS = [
  'max',
  'mean', // alias: average
  'median',
  'min',
  'mode',
  'product',
  'standardDeviation',
  'sum',
  'sumSimple',
  'variance'
];
