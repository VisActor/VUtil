import type { Dict } from '../type';

export default function substitute<T>(str: string, o: Dict<T>) {
  if (!str || !o) {
    return str;
  }
  return str.replace(/\\?\{([^{}]+)\}/g, (match, name): any => {
    if (match.charAt(0) === '\\') {
      return match.slice(1);
    }
    return o[name] === undefined ? '' : o[name];
  });
}
