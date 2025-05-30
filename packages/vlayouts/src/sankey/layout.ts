import type { ILogger } from '@visactor/vutils';
import {
  clamp,
  clamper,
  field,
  isFunction,
  isNil,
  isNumber,
  isString,
  Logger,
  minInArray,
  pickWithout,
  toValidNumber
} from '@visactor/vutils';
import { calculateNodeValue } from './hierarchy';
import type {
  SankeyData,
  SankeyOptions,
  SankeyLinkDatum,
  SankeyNodeDatum,
  SankeyLinkElement,
  SankeyNodeElement,
  HierarchyNodeDatum
} from './interface';

function left(node: SankeyNodeElement) {
  return node.depth;
}

function right(node: SankeyNodeElement, maxDepth: number) {
  return maxDepth - 1 - node.endDepth;
}

function justify(node: SankeyNodeElement, maxDepth: number) {
  return node.sourceLinks.length ? node.depth : maxDepth - 1;
}

function center(node: SankeyNodeElement, maxDepth: number, nodeMap: Record<string | number, SankeyNodeElement>) {
  return node.targetLinks.length
    ? node.depth
    : node.sourceLinks.length
    ? minInArray(node.sourceLinks.map(link => nodeMap[link.target].depth)) - 1
    : 0;
}

const ascendingNodeBreadth = (a: SankeyNodeElement, b: SankeyNodeElement) => {
  return a?.y0 - b?.y0;
};

const calcDivideValue = (node: SankeyNodeElement, isTarget?: boolean) => {
  if (isNil(node.value)) {
    return null;
  }

  const res = (isTarget ? node.targetLinks : node.sourceLinks).reduce(
    (res, sLink) => {
      if (isNil(sLink.value)) {
        res.count += 1;
      } else {
        res.sum += sLink.value;
      }

      return res;
    },
    { sum: 0, count: 0 }
  );

  return res.count > 0 ? (node.value - res.sum) / res.count : null;
};

const alignFunctions = {
  left,
  right,
  justify,
  center,
  start: left,
  end: right
};

const linkClampe = clamper(0, 1);

export class SankeyLayout {
  private options: SankeyOptions;

  private _getNodeKey?: (datum: SankeyNodeDatum) => string;
  private _alignFunc: (
    node: SankeyNodeElement,
    maxDepth: number,
    nodeMap: Record<string | number, SankeyNodeElement>
  ) => number;

  /** runtime vars */
  private _maxDepth: number;
  private _gapY: number;
  private _viewBox: { x0: number; x1: number; y0: number; y1: number; width: number; height: number };
  private _nodeMap: Record<string | number, SankeyNodeElement>;
  private _isHierarchic?: boolean;
  private _logger: ILogger;

  static defaultOptions: Partial<SankeyOptions> = {
    iterations: 6,
    nodeAlign: 'justify',
    direction: 'horizontal',
    nodeWidth: 24,
    nodeGap: 8,
    crossNodeAlign: 'middle',
    dropIsolatedNode: true
  };
  constructor(options?: SankeyOptions) {
    this.options = Object.assign({}, SankeyLayout.defaultOptions, options);
    const keyOption = this.options.nodeKey;
    const keyFunc = isFunction(keyOption) ? keyOption : keyOption ? field(keyOption as string) : null;

    this._getNodeKey = keyFunc;
    this._logger = Logger.getInstance();
    this._alignFunc = isFunction(this.options.setNodeLayer)
      ? (node: SankeyNodeElement) => {
          return this.options.setNodeLayer(node.datum);
        }
      : alignFunctions[this.options.nodeAlign];
  }

  layout(
    data: SankeyData,
    config: { x0: number; x1: number; y0: number; y1: number } | { width: number; height: number }
  ) {
    if (!data) {
      return null;
    }

    const viewBox =
      'width' in config
        ? { x0: 0, x1: config.width, y0: 0, y1: config.height, width: config.width, height: config.height }
        : {
            x0: Math.min(config.x0, config.x1),
            x1: Math.max(config.x0, config.x1),
            y0: Math.min(config.y0, config.y1),
            y1: Math.max(config.y0, config.y1),
            width: Math.abs(config.x1 - config.x0),
            height: Math.abs(config.y1 - config.y0)
          };

    if (this.options.direction === 'vertical') {
      this._viewBox = {
        x0: viewBox.y0,
        x1: viewBox.y1,
        y0: viewBox.x0,
        y1: viewBox.x1,
        width: viewBox.height,
        height: viewBox.width
      };
    } else {
      this._viewBox = viewBox;
    }
    const result = this.computeNodeLinks(data);
    const nodes = result.nodes;
    let links = result.links;
    this._nodeMap = result.nodeMap;

    this.computeNodeValues(nodes);
    this.computeNodeDepths(nodes);

    if (['right', 'end', 'justify'].includes(this.options.nodeAlign)) {
      this.computeNodeEndDepths(nodes);
    }

    if (this._maxDepth <= 0) {
      // empty data
      return null;
    }
    const columns = this.computeNodeBreadths(nodes);
    this.computeLinkBreadths(nodes);

    nodes.forEach(node => {
      node.sourceLinks = node.sourceLinks.filter(link => !isNil(link.source) && !isNil(link.target));
      node.targetLinks = node.targetLinks.filter(link => !isNil(link.source) && !isNil(link.target));
    });
    links = links.filter(link => !isNil(link.source) && !isNil(link.target));

    if (this.options.direction === 'vertical') {
      if (this.options.inverse) {
        const viewY1 = this._viewBox.x1;
        nodes.forEach(node => {
          const { y0, y1, x0, x1 } = node;

          node.y0 = viewY1 - x1;
          node.y1 = viewY1 - x0;
          node.x0 = y0;
          node.x1 = y1;
        });

        links.forEach(link => {
          link.vertical = true;
          const { x0, x1, y0, y1 } = link;

          link.x0 = y0;
          link.x1 = y1;
          link.y0 = viewY1 - x0;
          link.y1 = viewY1 - x1;
        });
      } else {
        nodes.forEach(node => {
          const { y0, y1 } = node;

          node.y0 = node.x0;
          node.y1 = node.x1;
          node.x0 = y0;
          node.x1 = y1;
        });

        links.forEach(link => {
          link.vertical = true;
          const x0 = link.x0;
          const x1 = link.x1;
          link.x0 = link.y0;
          link.x1 = link.y1;
          link.y0 = x0;
          link.y1 = x1;
        });
      }
    } else if (this.options.inverse) {
      nodes.forEach(node => {
        const { x0, x1 } = node;
        node.x0 = viewBox.x1 - x1;
        node.x1 = viewBox.x1 - x0;
      });

      links.forEach(link => {
        link.x0 = viewBox.x1 - link.x0;
        link.x1 = viewBox.x1 - link.x1;
      });
    }

    links.forEach(link => {
      const sourceNode = this._nodeMap[link.source];
      const targetNode = this._nodeMap[link.target];

      link.sourceRect = { x0: sourceNode.x0, x1: sourceNode.x1, y0: sourceNode.y0, y1: sourceNode.y1 };
      link.targetRect = { x0: targetNode.x0, x1: targetNode.x1, y1: targetNode.y1, y0: targetNode.y0 };
    });

    return { nodes, links, columns };
  }

  computeHierarchicNodeLinks(originalNodes: HierarchyNodeDatum[]) {
    const nodes: SankeyNodeElement[] = [];
    const links: SankeyLinkElement[] = [];
    const nodeMap: Record<string | number, SankeyNodeElement> = {};
    const linkMap: Record<string | number, SankeyLinkElement> = {};
    const originalLinks: (SankeyLinkDatum & { parents?: SankeyNodeElement[] })[] = [];

    calculateNodeValue(originalNodes);

    const doSubTree = (subTree: HierarchyNodeDatum[], depth: number, parents?: SankeyNodeElement[]) => {
      subTree.forEach((node, index) => {
        const nodeKey = this._getNodeKey
          ? this._getNodeKey(node)
          : parents
          ? `${parents[parents.length - 1].key}-${index}`
          : `${depth}-${index}`;
        const nodeValue = isNil(node.value) ? 0 : toValidNumber(node.value);

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
        if (parents) {
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

  computeSourceTargetNodeLinks(data: { nodes?: SankeyNodeDatum[]; links: SankeyLinkDatum[] }) {
    const nodes: SankeyNodeElement[] = [];
    const links: SankeyLinkElement[] = [];
    const nodeMap: Record<string | number, SankeyNodeElement> = {};

    if (data.nodes) {
      data.nodes.forEach((node, index) => {
        const nodeElement = {
          depth: -1,
          datum: node,
          index,
          key: this._getNodeKey ? this._getNodeKey(node) : index,
          value: node.value,
          sourceLinks: [] as SankeyLinkElement[],
          targetLinks: [] as SankeyLinkElement[]
        };

        nodeMap[nodeElement.key] = nodeElement;
        nodes.push(nodeElement);
      });
    }
    const invalidLinks: SankeyLinkDatum[] = [];

    data.links.forEach((link: SankeyLinkDatum, index) => {
      const hasSource = !isNil(link.source);
      const hasTarget = !isNil(link.target);
      if (data.nodes && (!nodeMap[link.source] || !nodeMap[link.target])) {
        return;
      }

      if (!data.nodes && hasSource && !nodeMap[link.source]) {
        nodeMap[link.source] = {
          value: undefined,
          depth: -1,
          index: nodes.length,
          key: link.source,
          datum: null,
          sourceLinks: [],
          targetLinks: []
        };
        nodes.push(nodeMap[link.source]);
      }

      if (!data.nodes && hasTarget && !nodeMap[link.target]) {
        nodeMap[link.target] = {
          value: undefined,
          depth: -1,
          index: nodes.length,
          key: link.target,
          datum: null,
          sourceLinks: [],
          targetLinks: []
        };
        nodes.push(nodeMap[link.target]);
      }

      // if (!hasSource || !hasTarget) {
      //   return;
      // }
      const linkElement = {
        index,
        source: link.source,
        target: link.target,
        datum: link,
        value: link.value
      };

      if (this.options.divideNodeValueToLink && isNil(link.value)) {
        invalidLinks.push(linkElement);
      }

      links.push(linkElement);

      if (hasSource) {
        nodeMap[link.source].sourceLinks.push(linkElement);
      }

      if (hasTarget) {
        nodeMap[link.target].targetLinks.push(linkElement);
      }
    });

    if (this.options.divideNodeValueToLink && invalidLinks.length) {
      invalidLinks.forEach(link => {
        const values = [calcDivideValue(nodeMap[link.source]), calcDivideValue(nodeMap[link.target], true)].filter(
          entry => !isNil(entry)
        );

        if (values.length) {
          link.value = minInArray(values);
        }
      });
    }

    return { nodeMap, nodes, links };
  }

  computeNodeLinks(data: SankeyData) {
    let res: {
      nodeMap: Record<string | number, SankeyNodeElement>;
      nodes: SankeyNodeElement[];
      links: SankeyLinkElement[];
    };
    if (!('links' in data)) {
      this._isHierarchic = true;
      res = this.computeHierarchicNodeLinks(data.nodes);
    } else {
      res = this.computeSourceTargetNodeLinks(data);
    }

    let nodes = res.nodes;
    const links = res.links;

    if (this.options.linkSortBy) {
      for (let i = 0, len = nodes.length; i < len; i++) {
        nodes[i].sourceLinks.sort(this.options.linkSortBy);
        nodes[i].targetLinks.sort(this.options.linkSortBy);
      }
    }

    if (this.options.dropIsolatedNode) {
      nodes = nodes.filter(node => node.targetLinks.length || node.sourceLinks.length);
    }

    return { nodes, links, nodeMap: res.nodeMap };
  }

  computeNodeValues(nodes: SankeyNodeElement[]) {
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];

      node.value = Math.max(
        isNil(node.value) ? 0 : toValidNumber(node.value),
        node.sourceLinks.reduce((sum, link: SankeyLinkElement) => {
          return sum + (toValidNumber(link.value) ?? 0);
        }, 0),
        node.targetLinks.reduce((sum, link: SankeyLinkElement) => {
          return sum + (toValidNumber(link.value) ?? 0);
        }, 0)
      );
    }
  }

  computeNodeDepths(nodes: SankeyNodeElement[]) {
    const n = nodes.length;
    let current: SankeyNodeElement[] = nodes;
    let next: SankeyNodeElement[];
    let nextMap: Record<string, boolean>;
    let depth = 0;
    let maxDepth = -1;
    const setNodeLayer = isFunction(this.options.setNodeLayer) ? this.options.setNodeLayer : null;

    while (current.length && depth < n) {
      next = [];
      nextMap = {};

      for (let i = 0, curLen = current.length; i < curLen; i++) {
        const node = current[i];

        if (node) {
          // 防止用户只设置了部分节点的层级
          node.depth = setNodeLayer ? setNodeLayer(node.datum) ?? depth : depth;

          if (setNodeLayer) {
            maxDepth = Math.max(node.depth, maxDepth);
          }
          if (node.sourceLinks && node.sourceLinks.length) {
            for (let j = 0, linkLen = node.sourceLinks.length; j < linkLen; j++) {
              const link = node.sourceLinks[j];
              if (!nextMap[link.target]) {
                next.push(this._nodeMap[link.target]);
                nextMap[link.target] = true;
              }
            }
          }
        }
      }
      current = next;
      depth += 1;
    }

    if (depth > n) {
      this._logger.warn('Error: there is a circular link');
    }

    this._maxDepth = setNodeLayer ? maxDepth + 1 : depth;
  }

  computeNodeEndDepths(nodes: SankeyNodeElement[]) {
    const n = nodes.length;
    let current: SankeyNodeElement[] = nodes;
    let next: SankeyNodeElement[];
    let nextMap: Record<string, boolean>;
    let depth = 0;

    while (current.length && depth < n) {
      next = [];
      nextMap = {};
      for (let i = 0, curLen = current.length; i < curLen; i++) {
        const node = current[i];

        if (node) {
          node.endDepth = depth;

          for (let j = 0, linkLen = node.targetLinks.length; j < linkLen; j++) {
            const link = node.targetLinks[j];
            if (!nextMap[link.source]) {
              next.push(this._nodeMap[link.source]);
              nextMap[link.source] = true;
            }
          }
        }
      }
      current = next;
      depth += 1;
    }

    if (depth > n) {
      this._logger.warn('Error: there is a circular link');
    }
  }

  computeNodeLayers(nodes: SankeyNodeElement[]) {
    const nodeWidthOption = this.options.nodeWidth;
    const linkWidthOption = this.options.linkWidth;
    const minStepWidth = this.options.minStepWidth;
    const width = this._viewBox.width;
    let nodeWidth: number = null;
    let linkWidth: number = null;
    let isEvenWidth = false;

    if (isString(nodeWidthOption)) {
      const ratio = clamp(parseFloat(nodeWidthOption.replace('%', '')) / 100, 0, 1);
      let stepWidth = width / (this._maxDepth - 1 + ratio);

      if (minStepWidth > 0) {
        stepWidth = Math.max(minStepWidth, stepWidth);
      }

      nodeWidth = stepWidth * ratio;
      linkWidth = stepWidth * (1 - ratio);
      isEvenWidth = true;
    } else if (isNumber(nodeWidthOption)) {
      nodeWidth = nodeWidthOption;

      if (isNumber(linkWidthOption)) {
        linkWidth = linkWidthOption;
      } else if (isNil(linkWidthOption)) {
        let stepWidth = (width - nodeWidthOption) / (this._maxDepth - 1);

        if (minStepWidth > 0) {
          stepWidth = Math.max(minStepWidth, stepWidth);
        }

        linkWidth = stepWidth - nodeWidthOption;
      }
      isEvenWidth = true;
    } else if (isFunction(nodeWidthOption) && isNumber(linkWidthOption)) {
      linkWidth = linkWidthOption;
    }
    const columns: SankeyNodeElement[][] = [];

    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      node.layer = this._isHierarchic
        ? node.depth
        : clamp(Math.floor(this._alignFunc(node, this._maxDepth, this._nodeMap)), 0, this._maxDepth - 1);
      const layer = node.layer;

      if (layer === this._maxDepth - 1) {
        node.isLastLayer = true;
      }
      if (isEvenWidth) {
        node.x0 = this._viewBox.x0 + layer * (nodeWidth + linkWidth);
        node.x1 = node.x0 + nodeWidth;
      }
      if (columns[layer]) {
        columns[layer].push(node);
      } else {
        columns[layer] = [node];
      }
    }
    if (this.options.nodeSortBy) {
      for (let j = 0, colLen = columns.length; j < colLen; j++) {
        columns[j].sort(this.options.nodeSortBy);
      }
    }

    if (!isEvenWidth && isFunction(nodeWidthOption)) {
      let curLayerX = this._viewBox.x0;
      for (let i = 0; i < this._maxDepth; i++) {
        const column = columns[i];
        let maxNodeWidth = 0;
        let maxLinkWidth = 0;

        for (let j = 0, colLen = column && column.length; j < colLen; j++) {
          const node = column[j];
          const curNodeWidth = nodeWidthOption(node);
          node.x0 = curLayerX;
          node.x1 = curLayerX + curNodeWidth;

          maxNodeWidth = Math.max(nodeWidth, curNodeWidth);

          const sourceLinks = node.sourceLinks;

          for (let k = 0, linkLen = sourceLinks.length; k < linkLen; k++) {
            const link = sourceLinks[k];
            const curLinkWidth = isFunction(linkWidthOption) ? linkWidthOption(link, this._viewBox) : linkWidth;

            maxLinkWidth = Math.max(maxLinkWidth, curLinkWidth);
          }
        }

        curLayerX += maxNodeWidth + maxLinkWidth;
      }
    }

    return columns;
  }

  initializeNodeBreadths(columns: SankeyNodeElement[][]) {
    const minLinkHeight = this.options.minLinkHeight ?? 0;
    let minNodeHeight = this.options.minNodeHeight ?? 0;
    const maxNodeHeight = this.options.maxNodeHeight ?? Infinity;
    let maxLinkHeight = this.options.maxLinkHeight;

    if (isNil(minNodeHeight) || minNodeHeight < minLinkHeight) {
      minNodeHeight = minLinkHeight;
    }

    if (isNil(maxLinkHeight) || maxLinkHeight > maxNodeHeight) {
      maxLinkHeight = maxNodeHeight;
    }

    let ky = 0;
    let getGapY: (node: SankeyNodeElement) => number = null;
    let forceNodeHeight: number = null;

    if (isFunction(this.options.nodeGap)) {
      getGapY = this.options.nodeGap;
      ky = columns.reduce((val: number, column: SankeyNodeElement[]) => {
        const sumValue = column.reduce((sum, node) => {
          return sum + node.value;
        }, 0);
        const sumGapY = column.reduce((sum, node) => {
          return sum + (this.options.nodeGap as (node: SankeyNodeElement) => number)(node);
        }, 0);

        return Math.min(val, (this._viewBox.height - sumGapY) / sumValue);
      }, Infinity);
    } else {
      const maxRowCount = columns.reduce((cnt: number, column: SankeyNodeElement[]) => {
        return Math.max(cnt, column.length);
      }, 0);
      const maxStepHeight = this._viewBox.height / maxRowCount;
      let gapY = Math.min(this.options.nodeGap, maxStepHeight);

      if (minNodeHeight + gapY > maxStepHeight) {
        gapY = minNodeHeight >= maxStepHeight ? maxStepHeight / 2 : (maxStepHeight - minNodeHeight) / 2;
        minNodeHeight = Math.min(maxStepHeight - gapY, minNodeHeight);
      }
      getGapY = () => gapY;
      this._gapY = gapY;

      if (this.options.equalNodeHeight) {
        forceNodeHeight = this._viewBox.height / maxRowCount - gapY;
      } else {
        const calGapY = minNodeHeight > 0 ? Math.max(gapY, minNodeHeight) : gapY;
        ky = columns.reduce((val: number, column: SankeyNodeElement[]) => {
          const sumValue = column.reduce((sum, node) => {
            return sum + node.value;
          }, 0);

          return Math.min(val, (this._viewBox.height - ((column.length - 1) * calGapY + minNodeHeight)) / sumValue);
        }, Infinity);
      }
    }

    const isStartGap = this.options.gapPosition === 'start';
    const isMiddleGap = !isStartGap && this.options.gapPosition !== 'end';
    const getNodeHeight = isNumber(this.options.nodeHeight)
      ? (node: SankeyNodeElement) => this.options.nodeHeight as number
      : isFunction(this.options.nodeHeight)
      ? (this.options.nodeHeight as (node: SankeyNodeElement) => number)
      : forceNodeHeight > 0
      ? (node: SankeyNodeElement) => {
          return forceNodeHeight;
        }
      : (node: SankeyNodeElement) => {
          return Math.max(node.value * ky, 0);
        };
    const getLinkHeight = isNumber(this.options.linkHeight)
      ? () => this.options.linkHeight as number
      : isFunction(this.options.linkHeight)
      ? (this.options.linkHeight as (
          link: SankeyLinkElement,
          sourceNode: SankeyNodeElement,
          sourceNodeHeight: number
        ) => number)
      : (link: SankeyLinkElement, sourceNode: SankeyNodeElement, sourceNodeHeight: number) => {
          return Math.min(
            Math.max(
              sourceNode.value ? sourceNodeHeight * linkClampe(link.value / sourceNode.value) : 0,
              minLinkHeight,
              0
            ),
            maxLinkHeight
          );
        };

    for (let i = 0, columnCount = columns.length; i < columnCount; i++) {
      const nodes = columns[i];

      if (!nodes || !nodes.length) {
        continue;
      }

      let y = this._viewBox.y0;
      let gapY = 0;
      let nodeHeight = 0;
      let calculatedNodeHeight = 0;
      for (let j = 0, len = nodes.length; j < len; j++) {
        const node = nodes[j];
        gapY = getGapY(node);

        if (isStartGap) {
          y += gapY;
        }

        calculatedNodeHeight = getNodeHeight(node);
        nodeHeight = Math.min(Math.max(calculatedNodeHeight, minNodeHeight), maxNodeHeight);

        node.y0 = y;
        node.y1 = y + nodeHeight;

        y = isStartGap ? node.y1 : node.y1 + gapY;

        for (let k = 0, linkLen = node.sourceLinks.length; k < linkLen; k++) {
          const link = node.sourceLinks[k];
          link.thickness = getLinkHeight(link, node, calculatedNodeHeight);
        }
      }

      let deltaY = this._viewBox.y1 - y + (isMiddleGap ? gapY : 0);

      if (deltaY > 0) {
        if (this.options.crossNodeAlign === 'start') {
          // do nothing
        } else if (this.options.crossNodeAlign === 'end') {
          for (let j = 0, len = nodes.length; j < len; ++j) {
            const node = nodes[j];
            node.y0 += deltaY;
            node.y1 += deltaY;
          }
        } else if (this.options.crossNodeAlign === 'parent') {
          const sourceNodes = nodes.reduce((res: Record<string, boolean>, node) => {
            if (node.targetLinks && node.targetLinks.length) {
              node.targetLinks.forEach(link => {
                res[link.source] = true;
              });
            }
            return res;
          }, {});

          if (Object.keys(sourceNodes).length && columns[i - 1] && columns[i - 1].length) {
            const prevSourceNodes = columns[i - 1].filter(node => sourceNodes[node.key]);

            if (prevSourceNodes && prevSourceNodes.length && prevSourceNodes[0].y0 !== nodes[0].y0) {
              const startY = prevSourceNodes[0].y0;
              const newDeltaY = startY - nodes[0].y0;

              for (let j = 0, len = nodes.length; j < len; ++j) {
                const node = nodes[j];
                node.y0 += newDeltaY;
                node.y1 += newDeltaY;
              }
            }
          }
        } else {
          deltaY = deltaY / (nodes.length + 1);
          for (let j = 0, len = nodes.length; j < len; ++j) {
            const node = nodes[j];
            node.y0 += deltaY * (j + 1);
            node.y1 += deltaY * (j + 1);
          }
        }
      } else if (deltaY < 0 && nodes.length > 1) {
        deltaY = deltaY / (nodes.length - 1);

        if (gapY + deltaY >= 0) {
          gapY += deltaY;

          this._gapY = Math.min(gapY);

          for (let j = 1, len = nodes.length; j < len; ++j) {
            const node = nodes[j];
            node.y0 += deltaY * j;
            node.y1 += deltaY * j;
          }
        }
      }
      this.reorderLinks(nodes);
    }
  }

  computeNodeBreadths(nodes: SankeyNodeElement[]) {
    const columns = this.computeNodeLayers(nodes);

    this.initializeNodeBreadths(columns);
    const iterations = this.options.iterations;

    /**
     * don't adjust the order of node when the data is hierarchy data or the layer of node is set customizedly
     */
    if (!this._isHierarchic && !isFunction(this.options.setNodeLayer) && !isFunction(this.options.nodeGap)) {
      for (let i = 0; i < iterations; ++i) {
        const alpha = Math.pow(0.99, i);
        const beta = Math.max(1 - alpha, (i + 1) / iterations);

        this.relaxRightToLeft(columns, alpha, beta);
        this.relaxLeftToRight(columns, alpha, beta);
      }
    }

    return columns;
  }

  // Reposition each node based on its incoming (target) links.
  relaxLeftToRight(columns: SankeyNodeElement[][], alpha: number, beta: number) {
    for (let i = 1, n = columns.length; i < n; ++i) {
      const column = columns[i];
      for (let j = 0, colLen = column.length; j < colLen; j++) {
        const target = column[j];
        let y = 0;
        let w = 0;

        for (let k = 0, linkLen = target.targetLinks.length; k < linkLen; k++) {
          const link = target.targetLinks[k];
          const v = link.value * (target.layer - this._nodeMap[link.source].layer);
          y += this.targetTop(this._nodeMap[link.source], target) * v;
          w += v;
        }
        if (!(w > 0)) {
          continue;
        }
        const dy = (y / w - target.y0) * alpha;
        target.y0 += dy;
        target.y1 += dy;
        this.reorderNodeLinks(target);
      }
      if (isNil(this.options.nodeSortBy)) {
        column.sort(ascendingNodeBreadth);
      }
      this.resolveCollisions(column, beta);
    }
  }

  // Reposition each node based on its outgoing (source) links.
  relaxRightToLeft(columns: SankeyNodeElement[][], alpha: number, beta: number) {
    for (let n = columns.length, i = n - 2; i >= 0; --i) {
      const column = columns[i];
      for (let j = 0, colLen = column.length; j < colLen; j++) {
        const source = column[j];
        let y = 0;
        let w = 0;

        for (let k = 0, linkLen = source.sourceLinks.length; k < linkLen; k++) {
          const link = source.sourceLinks[k];
          const v = link.value * (this._nodeMap[link.target].layer - source.layer);
          y += this.sourceTop(source, this._nodeMap[link.target]) * v;
          w += v;
        }
        if (!(w > 0)) {
          continue;
        }
        const dy = (y / w - source.y0) * alpha;
        source.y0 += dy;
        source.y1 += dy;
        this.reorderNodeLinks(source);
      }
      if (this.options.nodeSortBy === undefined) {
        column.sort(ascendingNodeBreadth);
      }
      this.resolveCollisions(column, beta);
    }
  }

  resolveCollisions(nodes: SankeyNodeElement[], alpha: number) {
    const i = nodes.length >> 1;
    const subject = nodes[i];
    this.resolveCollisionsBottomToTop(nodes, subject.y0 - this._gapY, i - 1, alpha);
    this.resolveCollisionsTopToBottom(nodes, subject.y1 + this._gapY, i + 1, alpha);
    this.resolveCollisionsBottomToTop(nodes, this._viewBox.y1, nodes.length - 1, alpha);
    this.resolveCollisionsTopToBottom(nodes, this._viewBox.y0, 0, alpha);
  }

  // Push any overlapping nodes down.
  resolveCollisionsTopToBottom(nodes: SankeyNodeElement[], y: number, i: number, alpha: number) {
    for (; i < nodes.length; ++i) {
      const node = nodes[i];
      const dy = (y - node.y0) * alpha;
      if (dy > 1e-6) {
        (node.y0 += dy), (node.y1 += dy);
      }
      y = node.y1 + this._gapY;
    }
  }

  // Push any overlapping nodes up.
  resolveCollisionsBottomToTop(nodes: SankeyNodeElement[], y: number, i: number, alpha: number) {
    for (; i >= 0; --i) {
      const node = nodes[i];
      const dy = (node.y1 - y) * alpha;
      if (dy > 1e-6) {
        node.y0 -= dy;
        node.y1 -= dy;
      }
      y = node.y0 - this._gapY;
    }
  }

  // Returns the target.y0 that would produce an ideal link from source to target.
  targetTop(source: SankeyNodeElement, target: SankeyNodeElement) {
    let y = source.y0 - ((source.sourceLinks.length - 1) * this._gapY) / 2;
    let i: number;
    let len: number;
    let link: SankeyLinkElement;

    for (i = 0, len = source.sourceLinks.length; i < len; i++) {
      link = source.sourceLinks[i];

      if (link.target === target.key) {
        break;
      }
      y += link.thickness + this._gapY;
    }
    for (i = 0, len = target.targetLinks.length; i < len; i++) {
      link = target.targetLinks[i];
      if (link.source === source.key) {
        break;
      }
      y -= link.thickness;
    }
    return y;
  }

  // Returns the source.y0 that would produce an ideal link from source to target.
  sourceTop(source: SankeyNodeElement, target: SankeyNodeElement) {
    let y = target.y0 - ((target.targetLinks.length - 1) * this._gapY) / 2;
    let i: number;
    let len: number;
    let link: SankeyLinkElement;

    for (i = 0, len = target.targetLinks.length; i < len; i++) {
      link = target.targetLinks[i];
      if (link.source === source.key) {
        break;
      }
      y += link.thickness + this._gapY;
    }
    for (i = 0, len = source.sourceLinks.length; i < len; i++) {
      link = source.sourceLinks[i];
      if (link.target === target.key) {
        break;
      }
      y -= link.thickness;
    }
    return y;
  }

  computeLinkBreadthsNoOverlap(nodes: SankeyNodeElement[]) {
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];

      let y0 = node.y0;
      let reachBottom = false;

      for (let j = 0, linkLen = node.sourceLinks.length; j < linkLen; j++) {
        const link = node.sourceLinks[j];
        if (!reachBottom) {
          link.y0 = y0 + link.thickness / 2;
        }
        link.x0 = node.x1;

        if (y0 + link.thickness > node.y1 || reachBottom) {
          link.y0 = node.y1 - link.thickness / 2;
          reachBottom = true;
        } else {
          y0 += link.thickness;
        }
      }

      let y1 = node.y0;
      reachBottom = false;

      for (let j = 0, linkLen = node.targetLinks.length; j < linkLen; j++) {
        const link = node.targetLinks[j];

        if (!reachBottom) {
          link.y1 = y1 + link.thickness / 2;
        }
        link.x1 = node.x0;

        if (y1 + link.thickness > node.y1 || reachBottom) {
          link.y1 = node.y1 - link.thickness / 2;
          reachBottom = true;
        } else {
          y1 += link.thickness;
        }
      }
    }
  }

  computeLinkBreadthsOverlap(nodes: SankeyNodeElement[]) {
    const linkOverlap = this.options.linkOverlap;

    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      const pos = linkOverlap === 'start' ? node.y0 : linkOverlap === 'end' ? node.y1 : (node.y0 + node.y1) / 2;
      const sign = linkOverlap === 'start' ? 0.5 : linkOverlap === 'end' ? -0.5 : 0;

      for (let j = 0, linkLen = node.sourceLinks.length; j < linkLen; j++) {
        const link = node.sourceLinks[j];
        link.y0 = pos + sign * link.thickness;
        link.x0 = node.x1;
      }

      for (let j = 0, linkLen = node.targetLinks.length; j < linkLen; j++) {
        const link = node.targetLinks[j];
        link.y1 = pos + sign * link.thickness;
        link.x1 = node.x0;
      }
    }
  }

  computeLinkBreadths(nodes: SankeyNodeElement[]) {
    if (this.options.linkOverlap) {
      this.computeLinkBreadthsOverlap(nodes);
    } else {
      this.computeLinkBreadthsNoOverlap(nodes);
    }
  }

  reorderNodeLinks(node: SankeyNodeElement) {
    if (isNil(this.options.linkSortBy)) {
      const targetLinks = node.targetLinks;
      const sourceLinks = node.sourceLinks;

      for (let j = 0, linkLen = targetLinks.length; j < linkLen; j++) {
        const link = targetLinks[j];
        this._nodeMap[link.source].sourceLinks.sort(this._ascendingTargetBreadth);
      }
      for (let j = 0, linkLen = sourceLinks.length; j < linkLen; j++) {
        const link = sourceLinks[j];
        this._nodeMap[link.target].targetLinks.sort(this._ascendingSourceBreadth);
      }
    }
  }

  reorderLinks(nodes: SankeyNodeElement[]) {
    if (isNil(this.options.linkSortBy)) {
      for (let i = 0, len = nodes.length; i < len; i++) {
        const node = nodes[i];
        node.sourceLinks.sort(this._ascendingTargetBreadth);
        node.targetLinks.sort(this._ascendingSourceBreadth);
      }
    }
  }

  private _ascendingSourceBreadth = (a: SankeyLinkElement, b: SankeyLinkElement) => {
    return ascendingNodeBreadth(this._nodeMap[a.source], this._nodeMap[b.source]) || a.index - b.index;
  };

  private _ascendingTargetBreadth = (a: SankeyLinkElement, b: SankeyLinkElement) => {
    return ascendingNodeBreadth(this._nodeMap[a.target], this._nodeMap[b.target]) || a.index - b.index;
  };
}
