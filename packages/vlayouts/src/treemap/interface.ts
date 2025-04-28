import type { HierarchicalDatum, HierarchicalNodeElement, ViewBoxOptions } from '../interface/common';

export interface TreemapOptions {
  /**
   * The gap width between two nodes which has the same depth, two kinds of value are supported
   * 1. number: set the gapWidth for nodes of every depth
   * 2. number[]: number[i] means the gapWidth for node which depth = i;
   */
  gapWidth?: number | number[];
  /**
   * The padding width, two kinds of value are supported
   * 1. number: set the padding for nodes of every depth
   * 2. number[]: number[i] means the padding for node which depth = i;
   */
  padding?: number | number[];
  /**
   * the width / height ratio
   */
  aspectRatio?: number;
  /**
   * The padding for non-leaf node, we can use this space to display a label
   * This pading will only works when the node has enough space
   */
  labelPadding?: number | number[];
  /**
   * The position of label for non-leaf node
   */
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * the type of algorithm
   */
  splitType?: 'binary' | 'dice' | 'slice' | 'sliceDice' | 'squarify';
  /** parse the key of node */
  nodeKey?: string | number | ((datum: TreemapDatum) => string | number);
  /**
   *  the max depth to be showed, when the node has depth > maxDepth, the node won't be calculated
   */
  maxDepth?: number;
  /**
   * when the area (this unit is px * px) of the node is smaller then this value, this node will be hide
   */
  minVisibleArea?: number | number[];
  /**
   * when the area (this unit is px * px) of the node is smaller then this value, this children of this node will be hide
   */
  minChildrenVisibleArea?: number | number[];
  /**
   * when the width or height of the node is smaller then this value, this node will be hide
   */
  minChildrenVisibleSize?: number | number[];
  /**
   * specify treemap node value field, defaults to `value`
   */
  valueField?: string;
}

export type TreemapTramsformOptions = TreemapOptions & ViewBoxOptions & { flatten?: boolean };

export type TreemapData = HierarchicalDatum[];

export type TreemapDatum = HierarchicalDatum;

/**
 * The node element after treemap layout
 */
export interface TreemapNodeElement extends Omit<HierarchicalNodeElement<TreemapDatum>, 'children'> {
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  width?: number;
  height?: number;
  labelRect?: { x0?: number; x1?: number; y0?: number; y1?: number };

  children?: TreemapNodeElement[];
}
