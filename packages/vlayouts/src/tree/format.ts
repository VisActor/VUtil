import type { TreeLinkElement, TreeNodeElement } from './interface';

export const flattenTreeLinks = <T = TreeLinkElement>(
  nodes: TreeNodeElement[],
  output: T[] = [],
  options?: {
    maxDepth?: number;
    callback?: (link: TreeLinkElement) => T;
  }
): T[] => {
  const hasMaxDepth = options?.maxDepth >= 0;

  nodes.forEach(node => {
    if (!hasMaxDepth || node.depth <= options.maxDepth - 1) {
      if (node.children) {
        node.children.forEach(child => {
          const link = {
            source: node,
            target: child,
            x0: node.x,
            y0: node.y,
            x1: child.x,
            y1: child.y,
            key: `${node.key}~${child.key}`
          };

          output.push(options?.callback ? options.callback(link) : (link as unknown as T));

          if (child.children?.length) {
            flattenTreeLinks([child], output, options);
          }
        });
      }
    }
  });

  return output;
};
