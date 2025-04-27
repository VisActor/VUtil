export type ViewBoxOptions = { width: number; height: number } | { x0: number; x1: number; y0: number; y1: number };

export interface HierarchicalDatum {
  value?: number;
  children?: HierarchicalDatum[];
}

export type HierarchicalData = HierarchicalDatum[];

export interface HierarchicalNodeElement<Datum> {
  key: string;
  parentKey?: string;
  flattenIndex: number;
  index: number;
  /** the depth of node, from source to target */
  depth: number;
  maxDepth: number;
  /** whether or not this node is a leaf node */
  isLeaf?: boolean;
  value: number;
  datum: Datum[];

  children?: HierarchicalNodeElement<Datum>[];
}

export type TextAlignType = 'left' | 'right' | 'center' | 'start' | 'end';
export type TextBaselineType = 'top' | 'middle' | 'bottom' | 'alphabetic';

export interface HierarchyLabelAttrs {
  x?: number;
  y?: number;
  text?: string;
  textAlign?: TextAlignType;
  textBaseline?: TextBaselineType;
  angle?: number;
  maxLineWidth?: number;
}
