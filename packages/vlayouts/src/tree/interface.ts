import type { HierarchicalDatum, HierarchicalNodeElement, ViewBoxOptions } from '../interface/common';

export interface TreeOptions {
  /**
   * The layout direction of chart
   */
  direction?: 'horizontal' | 'vertical' | 'LR' | 'RL' | 'TB' | 'BT';
  /**
   * layout tree in orthogonal | radial coordinate system
   */
  layoutType?: 'orthogonal' | 'radial';
  alignType?: 'leaf' | 'depth';
  /**
   * Specify the width of link, if not specified,
   * Compute the depth-most nodes for extents.
   */
  linkWidth?: number | number[];
  /**
   * Specify the min gap between two sibling nodes, if not specified, scale nodeGap based on the extent.
   */
  minNodeGap?: number;
  /** parse the key of node */
  nodeKey?: string | number | ((datum: HierarchicalDatum) => string | number);
}

export type TreeTramsformOptions = TreeOptions & ViewBoxOptions & { flatten?: boolean; maxDepth?: number };

export interface TreeNodeElement extends HierarchicalNodeElement<HierarchicalDatum> {
  children?: TreeNodeElement[];
  x?: number;
  y?: number;
}

export interface TreeLinkElement {
  source: TreeNodeElement;
  target: TreeNodeElement;
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  key?: string;
}
