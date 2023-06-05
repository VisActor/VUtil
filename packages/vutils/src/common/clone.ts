import isArray from './isArray';
import isDate from './isDate';
import isRegExp from './isRegExp';

function getRegExpFlags(re: any) {
  let flags = '';
  re.global && (flags += 'g');
  re.ignoreCase && (flags += 'i');
  re.multiline && (flags += 'm');
  return flags;
}

// Adapted from https://github.com/pvorb/clone by Paul Vorbach
// License: https://github.com/pvorb/clone/blob/master/LICENSE
export default function clone(parent: any, circular = false, depth = 0, prototype: any = undefined) {
  // maintain two arrays for circular references, where corresponding parents
  // and children have the same index
  const allParents: Array<any> = [];
  const allChildren: Array<any> = [];

  if (typeof circular === 'undefined') {
    circular = true;
  }

  if (typeof depth === 'undefined') {
    depth = Infinity;
  }

  // recurse this function so we don't reset allParents and allChildren
  function _clone(parent: any, depth: number) {
    // cloning null always returns null
    if (parent === null) {
      return null;
    }

    if (depth === 0) {
      return parent;
    }

    let child;
    if (typeof parent !== 'object') {
      return parent;
    }

    if (isArray(parent)) {
      child = [];
    } else if (isRegExp(parent)) {
      child = new RegExp(parent.source, getRegExpFlags(parent));
      if (parent.lastIndex) {
        child.lastIndex = parent.lastIndex;
      }
    } else if (isDate(parent)) {
      child = new Date(parent.getTime());
    } else {
      if (typeof prototype === 'undefined') {
        child = Object.create(Object.getPrototypeOf(parent));
      } else {
        child = Object.create(prototype);
      }
    }

    if (circular) {
      const index = allParents.indexOf(parent);

      if (index !== -1) {
        return allChildren[index];
      }
      allParents.push(parent);
      allChildren.push(child);
    }

    for (const i in parent) {
      child[i] = _clone(parent[i], depth - 1);
    }

    return child;
  }
  return _clone(parent, depth);
}
