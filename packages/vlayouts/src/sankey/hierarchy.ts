import { isNil, pickWithout, toValidNumber } from '@visactor/vutils';

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

export function computeHierarchicNodeLinks(
  originalNodes: HierarchyNodeDatum[],
  nodeKeyFunc: (node: HierarchyNodeDatum) => string
) {
  const nodes: SankeyNodeElement[] = [];
  const links: SankeyLinkElement[] = [];
  const nodeMap: Record<string | number, SankeyNodeElement> = {};
  const linkMap: Record<string | number, SankeyLinkElement> = {};
  const originalLinks: (SankeyLinkDatum & { parents?: SankeyNodeElement[] })[] = [];

  makeHierarchicNodes(originalNodes, nodeKeyFunc, nodes, nodeMap, originalLinks);

  originalLinks.forEach((link, index) => {
    const key = `${link.source}-${link.target}`;
    const linkDatum = pickWithout(link, ['parents']);

    (linkDatum as any).parents = link.parents.map(node => {
      return pickWithout(node, ['sourceLinks', 'targetLinks']);
    });

    if (linkMap[key]) {
      linkMap[key].value += toValidNumber(link.value);

      (linkMap[key].datum as SankeyLinkDatum[]).push(linkDatum as SankeyLinkDatum);

      return;
    }
    const linkElement = {
      index,
      key: `${link.source}-${link.target}`,
      source: link.source,
      target: link.target,
      datum: [linkDatum] as any,
      value: link.value,
      parents: link.parents.map(parent => parent.key)
    };

    links.push(linkElement);
    nodeMap[link.source].sourceLinks.push(linkElement);
    nodeMap[link.target].targetLinks.push(linkElement);
    linkMap[key] = linkElement;
  });

  return { nodes, links, nodeMap };
}
