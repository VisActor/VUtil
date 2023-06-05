import type { Dict } from '../type';

export type KeyOfDistributive<T> = T extends unknown ? keyof T : never;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export function keys<T extends any>(obj: T): (KeyOfDistributive<T> & string)[] {
  if (!obj) {
    return [];
  }
  // Return type should be `keyof T` but exclude `number`, becuase
  // `Object.keys` only return string rather than `number | string`.
  type TKeys = KeyOfDistributive<T> & string;
  if (Object.keys) {
    return Object.keys(obj) as TKeys[];
  }
  const keyList: TKeys[] = [];
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      keyList.push(key as any);
    }
  }
  return keyList;
}

export function defaults<T extends Dict<any>, S extends Dict<any>>(target: T, source: S, overlay?: boolean): T & S {
  const keysArr = keys(source);
  for (let i = 0; i < keysArr.length; i++) {
    const key = keysArr[i];
    if (overlay ? source[key] != null : (target as T & S)[key] == null) {
      (target as S & T)[key] = (source as T & S)[key];
    }
  }
  return target as T & S;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function mixin<T, S>(target: T | Function, source: S | Function, override: boolean = true) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  target = 'prototype' in target ? target.prototype : target;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  source = 'prototype' in source ? source.prototype : source;
  // If build target is ES6 class. prototype methods is not enumerable. Use getOwnPropertyNames instead
  // TODO: Determine if source is ES6 class?
  if (Object.getOwnPropertyNames) {
    const keyList = Object.getOwnPropertyNames(source);
    for (let i = 0; i < keyList.length; i++) {
      const key = keyList[i];
      if (key !== 'constructor') {
        if (override ? (source as any)[key] != null : (target as any)[key] == null) {
          (target as any)[key] = (source as any)[key];
        }
      }
    }
  } else {
    defaults(target as Dict<any>, source as Dict<any>, override);
  }
}
