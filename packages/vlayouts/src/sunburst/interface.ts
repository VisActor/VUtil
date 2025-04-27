import type {
  HierarchicalDatum,
  HierarchicalNodeElement,
  HierarchyLabelAttrs,
  ViewBoxOptions
} from '../interface/common';

type PositionType = string | number;

export interface SunburstLabelConfig {
  align?: 'start' | 'end' | 'center';
  rotate?: 'tangential' | 'radial';
  offset?: number;
}
export type SunburstLabelOptions = boolean | SunburstLabelConfig;

/**
 * The options of sunburst
 */
export interface SunburstOptions {
  startAngle?: number;
  endAngle?: number;
  center?: [PositionType, PositionType];
  innerRadius?: PositionType | PositionType[];
  outerRadius?: PositionType | PositionType[];
  gapRadius?: number | number[];
  /** parse the key of node */
  nodeKey?: string | number | ((datum: HierarchicalDatum) => string | number);
  label?: SunburstLabelOptions | SunburstLabelOptions[];
}

export type SunburstTramsformOptions = SunburstOptions & ViewBoxOptions & { flatten?: boolean; maxDepth?: number };

/**
 * The node element after sunburst layout
 */
export interface SunburstNodeElement extends HierarchicalNodeElement<HierarchicalDatum> {
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  x?: number;
  y?: number;

  children?: SunburstNodeElement[];
  label?: HierarchyLabelAttrs;
}
