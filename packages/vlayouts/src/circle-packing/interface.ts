import type {
  HierarchicalDatum,
  HierarchicalNodeElement,
  HierarchyLabelAttrs,
  ViewBoxOptions
} from '../interface/common';

export interface ICircle {
  x?: number;
  y?: number;
  radius?: number;
}

export interface CirclePackingOptions {
  nodeSort?: boolean | ((a: CirclePackingNodeElement, b: CirclePackingNodeElement) => number);
  padding?: number | number[];
  /**
   * set the radius of node, if not specified, we'll set `Math.sqrt(node.value);`.
   */
  setRadius?: (datum: CirclePackingNodeElement) => number;
  /** parse the key of node */
  nodeKey?: string | number | ((datum: HierarchicalDatum) => string | number);
  includeRoot?: boolean;
}

export type CirclePackingTramsformOptions = CirclePackingOptions &
  ViewBoxOptions & { flatten?: boolean; maxDepth?: number };

/**
 * The node element after sunburst layout
 */
export interface CirclePackingNodeElement extends HierarchicalNodeElement<HierarchicalDatum>, ICircle {
  children?: CirclePackingNodeElement[];
  label?: HierarchyLabelAttrs;
}
