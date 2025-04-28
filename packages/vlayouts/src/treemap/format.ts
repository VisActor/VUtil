import type { TreemapNodeElement } from './interface';

export const flattenNodes = <T = TreemapNodeElement>(
  nodes: TreemapNodeElement[],
  output: T[] = [],
  options?: {
    maxDepth?: number;
    callback?: (node: TreemapNodeElement) => T;
  }
) => {
  const hasMaxDepth = options?.maxDepth >= 0;

  nodes.forEach(node => {
    if (!hasMaxDepth || node.depth <= options.maxDepth) {
      output.push(options?.callback ? options.callback(node) : (node as unknown as T));
      if (node.children) {
        if (hasMaxDepth && node.depth === options.maxDepth) {
          node.children = null;
          node.isLeaf = true;
        } else {
          flattenNodes(node.children, output, options);
        }
      }
    }
  });

  return output;
};
