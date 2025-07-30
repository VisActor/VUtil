import { isNil, toValidNumber } from '@visactor/vutils';

import type { HierarchyNodeDatum, SankeyLinkDatum, SankeyLinkElement, SankeyNodeElement } from './interface';

export const calculateNodeValue = (subTree: HierarchyNodeDatum[]) => {
  let sum = 0;
  subTree.forEach((node, index) => {
    if (isNil(node.value)) {
      if (node.children?.length) {
        node.value = calculateNodeValue(node.children);
      } else {
        node.value = 0;
      }
    }

    sum += Math.abs(node.value);
  });

  return sum;
};

export function makeHierarchicNodes(
  originalNodes: HierarchyNodeDatum[],
  nodeKeyFunc: (node: HierarchyNodeDatum) => string,
  nodes: SankeyNodeElement[] = [],
  nodeMap: Record<string | number, SankeyNodeElement> = {},
  originalLinks?: (SankeyLinkDatum & { parents?: SankeyNodeElement[] })[]
) {
  calculateNodeValue(originalNodes);

  const doSubTree = (subTree: HierarchyNodeDatum[], depth: number, parents?: SankeyNodeElement[]) => {
    subTree.forEach((node, index) => {
      const nodeKey = nodeKeyFunc
        ? nodeKeyFunc(node)
        : parents
        ? `${parents[parents.length - 1].key}-${index}`
        : `${depth}-${index}`;
      const nodeValue: number = (isNil(node.value) ? 0 : toValidNumber(node.value)) as number;

      if (nodeMap[nodeKey]) {
        nodeMap[nodeKey].value = undefined;
      } else {
        const nodeElement: SankeyNodeElement = {
          depth,
          datum: node,
          index: index,
          key: nodeKey,
          value: nodeValue,
          sourceLinks: [] as SankeyLinkElement[],
          targetLinks: [] as SankeyLinkElement[]
        };

        nodeMap[nodeKey] = nodeElement;
        nodes.push(nodeElement);
      }
      if (parents && originalLinks) {
        originalLinks.push({
          source: parents[parents.length - 1].key,
          target: nodeKey,
          value: nodeValue,
          parents
        });
      }

      if (node.children && node.children.length) {
        doSubTree(node.children, depth + 1, parents ? parents.concat([nodeMap[nodeKey]]) : [nodeMap[nodeKey]]);
      }
    });
  };

  doSubTree(originalNodes, 0, null);
  return nodes;
}
