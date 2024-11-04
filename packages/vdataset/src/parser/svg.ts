import type { IMatrix } from '@visactor/vutils';
import { Matrix, isString, isValid, isValidNumber, merge, toCamelCase } from '@visactor/vutils';
import type { DataView } from '../data-view';
import type { Parser } from './index';

export interface ISVGSourceOption {
  type?: 'svg';
  customDOMParser?: (svg: string) => Document;
}

export interface SVGParserResult {
  root: SVGParsedElement;
  width: number;
  height: number;
  elements: SVGParsedElement[];
  viewBoxRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface SVGParsedElement {
  id: string;
  tagName: string;
  graphicType: string;
  attributes: Record<string, any>;
  name?: string;
  transform?: IMatrix;
  parent?: SVGParsedElement;
  value?: string;
  _inheritStyle?: Record<string, any>;
  _textGroupStyle?: Record<string, any>;
  _nameFromParent?: string;
  [key: string]: any;
}
const tagNameToType = {
  svg: 'group',
  rect: 'rect',
  line: 'rule',
  polygon: 'polygon',
  path: 'path',
  polyline: 'line',
  g: 'group',
  circle: 'arc',
  ellipse: 'arc'
};
const validTagName = Object.keys(tagNameToType);
const validGroupNode = ['g', 'svg', 'text', 'tspan', 'switch'];
const validTextAttributes = ['font-size', 'font-family', 'font-weight', 'font-style', 'text-align', 'text-anchor'];
const validCircleAttributes = ['cx', 'cy', 'r'];
const validEllipseAttributes = ['cx', 'cy', 'rx', 'ry'];
const validLineAttributes = ['x1', 'x2', 'y1', 'y2'];
const validAttributes = [
  'visibility',
  'x',
  'y',
  'width',
  'height',
  'd',
  'points',
  'stroke',
  'stroke-width',
  'fill',
  'fill-opacity',
  'stroke-opacity',
  ...validTextAttributes,
  ...validCircleAttributes,
  ...validEllipseAttributes,
  ...validLineAttributes
];
const validInheritAttributes = [
  'visible',
  'fill',
  'stroke',
  'stroke-width',
  'fill-opacity',
  'stroke-opacity',
  ...validTextAttributes
];
const numberReg = /-?([0-9]*\.)?[0-9]+([eE]-?[0-9]+)?/g;
function splitNumberSequence(rawStr: string): string[] {
  return rawStr.match(numberReg) || [];
}
/**
 * 将 svg 字符串转换为指定的数据结构 SVGParserResult
 * @param data
 * @param options
 * @returns
 */
export const svgParser: Parser = (data: string, option: ISVGSourceOption = {}, dataView: DataView) => {
  let parser = option.customDOMParser;
  if (!parser) {
    if (window?.DOMParser) {
      parser = (svg: string) => new DOMParser().parseFromString(svg, 'text/xml');
    }
  }

  if (!parser) {
    throw new Error('No Available DOMParser!');
  }

  const svg = parser(data);

  let node = svg.nodeType === 9 ? svg.firstChild : svg;
  while (node && (node.nodeName.toLowerCase() !== 'svg' || node.nodeType !== 1)) {
    node = node.nextSibling;
  }
  if (node) {
    const result = parseSvgNode(node as SVGElement);
    return result;
  }
  return null;
};

let idx = 0;

function parseSvgNode(svg: SVGElement, opt: any = {}) {
  const elements: SVGParsedElement[] = [];

  const root: SVGParsedElement = parseNode(svg, null);
  let width = parseFloat(svg.getAttribute('width') || opt.width);
  let height = parseFloat(svg.getAttribute('height') || opt.height);
  !isValidNumber(width) && (width = null);
  !isValidNumber(height) && (height = null);

  const viewBox = svg.getAttribute('viewBox');
  let viewBoxRect: SVGParserResult['viewBoxRect'];

  if (viewBox) {
    const viewBoxArr = splitNumberSequence(viewBox);
    if (viewBoxArr.length >= 4) {
      viewBoxRect = {
        x: parseFloat((viewBoxArr[0] || 0) as string),
        y: parseFloat((viewBoxArr[1] || 0) as string),
        width: parseFloat(viewBoxArr[2]),
        height: parseFloat(viewBoxArr[3])
      };
      if (width || height) {
        const boundingRect = { x: 0, y: 0, width, height };
        const scaleX = boundingRect.width / viewBoxRect.width;
        const scaleY = boundingRect.height / viewBoxRect.height;
        const scale = Math.min(scaleX, scaleY);
        const transLateX = -(viewBoxRect.x + viewBoxRect.width / 2) * scale + (boundingRect.x + boundingRect.width / 2);
        const transLateY =
          -(viewBoxRect.y + viewBoxRect.height / 2) * scale + (boundingRect.y + boundingRect.height / 2);
        const viewBoxTransform = new Matrix().translate(transLateX, transLateY).scale(scale, scale);
        root.transform = viewBoxTransform;
      }
    }
  }

  traverse(svg as SVGElement, root, elements);
  return {
    root,
    width,
    height,
    elements,
    viewBoxRect
  };
}

function parseInheritAttributes(parsedElement: SVGParsedElement) {
  let inheritedAttrs;
  const { parent, attributes } = parsedElement;

  const parse = (parent: any) => {
    if (!parent) {
      return {};
    }
    return validInheritAttributes.reduce((acc, attrName) => {
      const camelAttrName = toCamelCase(attrName);
      if (isValid(parent[camelAttrName])) {
        acc[camelAttrName] = parent[camelAttrName];
      }
      return acc;
    }, {});
  };

  if (parent) {
    if (!parent._inheritStyle) {
      parent._inheritStyle = parse(parent.attributes);
    }
    inheritedAttrs = merge({}, parent._inheritStyle, parse(attributes));
  } else {
    inheritedAttrs = parse(attributes);
  }
  return inheritedAttrs;
}

function parseAttributes(el: Element) {
  const attrs = {} as any;
  const attributes = el.attributes ?? {};
  const style = (el as any).style ?? {};
  for (let i = 0; i < validAttributes.length; i++) {
    const attrName = validAttributes[i];
    const attrValue =
      isValid(style[attrName]) && style[attrName] !== '' ? style[attrName] : attributes[attrName]?.value;
    if (isValid(attrValue)) {
      attrs[toCamelCase(attrName)] = isNaN(+attrValue) ? attrValue : parseFloat(attrValue);
    }
  }

  if (style.display === 'none') {
    attrs.visible = false;
  }

  // 简单兼容处理 "xxx:12px" 类型的属性
  ['fontSize', 'strokeWidth', 'width', 'height'].forEach(attr => {
    const attrValue = attrs[attr];
    if (isString(attrs[attr])) {
      attrs[attr] = parseFloat(attrValue);
    }
  });

  return attrs;
}

function parseNode(node: SVGElement, parent: SVGParsedElement) {
  const tagName = node.tagName?.toLowerCase();
  if (node.nodeType === 3 || tagName === 'text' || tagName === 'tspan') {
    return parseText(node, parent);
  }

  if (!validTagName.includes(tagName)) {
    return null;
  }

  const parsed: SVGParsedElement = {
    tagName,
    graphicType: tagNameToType[tagName],
    attributes: parseAttributes(node),
    parent,
    name: node.getAttribute('name') ?? parent?.attributes?.name,
    id: node.getAttribute('id') ?? `${tagName}-${idx++}`,
    transform: parseTransform(node)
  };

  parsed._inheritStyle = parseInheritAttributes(parsed);

  if (parent && !isValid(parsed.name)) {
    parsed._nameFromParent = parent.name ?? parent._nameFromParent;
  }

  return parsed;
}

function parseText(node: SVGElement, parent: SVGParsedElement) {
  if (!parent) {
    return null;
  }

  const tagName = node.tagName?.toLowerCase();
  // 孤立 #text 节点不处理
  if (!tagName && parent.graphicType !== 'group') {
    return null;
  }

  // text 当作 group 处理
  // #text 都当作 text 处理
  const nodeAsGroup = tagName === 'text' || tagName === 'tspan';
  const elType = nodeAsGroup ? 'group' : 'text';
  const value = nodeAsGroup ? undefined : node.textContent?.replace(/\n/g, ' ').replace(/\s+/g, ' ');

  if (value === ' ') {
    return null;
  }

  let parsed: SVGParsedElement;

  if (nodeAsGroup) {
    parsed = {
      tagName,
      graphicType: elType,
      attributes: parseAttributes(node),
      parent,
      name: node.getAttribute('name'),
      id: node.getAttribute('id') ?? `${tagName}-${idx++}`,
      transform: parseTransform(node),
      value
    };
  } else {
    // #text or tspan
    parsed = {
      tagName,
      graphicType: 'text',
      attributes: parseAttributes(node),
      parent,
      name: parent?.name,
      id: node.getAttribute?.('id') ?? `${tagName}-${idx++}`,
      value
    };
  }

  parsed._inheritStyle = parseInheritAttributes(parsed);

  if (!isValid(parsed.name)) {
    parsed._nameFromParent = parent.name ?? parent._nameFromParent;
  }

  if (!nodeAsGroup) {
    parsed.attributes = parsed._inheritStyle;
  } else {
    if (parent._textGroupStyle) {
      parsed._textGroupStyle = merge({}, parent._textGroupStyle, parseAttributes(node));
    } else {
      parsed._textGroupStyle = parseAttributes(node);
    }
  }

  return parsed;
}

function parseTransform(node: SVGElement) {
  const transforms = (node as any).transform?.baseVal as SVGTransformList;
  if (!transforms) {
    return null;
  }
  const matrix = transforms.consolidate()?.matrix;
  if (!matrix) {
    return null;
  }
  const { a, b, c, d, e, f } = matrix;
  return new Matrix(a, b, c, d, e, f);
}

function traverse(node: SVGElement, parsedParent: SVGParsedElement, result: SVGParsedElement[] = []) {
  if (!node) {
    return;
  }

  let parseResult;
  if (node.nodeName !== 'svg') {
    parseResult = parseNode(node, parsedParent);
  }

  if (parseResult) {
    result.push(parseResult);
  }

  let child: SVGElement | null = validGroupNode.includes(node.tagName?.toLocaleLowerCase())
    ? (node.firstChild as SVGElement)
    : null;

  while (child) {
    traverse(child, parseResult ?? parsedParent, result);
    child = child.nextSibling as SVGElement;
  }
}
