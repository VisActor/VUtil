import type { LooseFunction } from '../type';

export class HashValue<T> {
  index: number;
  key: string;
  value: T;
}

// 基于 array 和 object的 HashTable
export class HashTable<T> {
  private items: { [key: string]: HashValue<T> };
  private itemList: Array<HashValue<T>>;
  constructor() {
    this.items = {};
    this.itemList = [];
  }
  get type() {
    return 'xhHashTable';
  }
  set(key: string, value: T): HashValue<T> {
    const vl = new HashValue<T>();
    vl.key = key;
    vl.value = value;
    let index = this.itemList.length;
    if (this.has(key)) {
      index = this.items[key].index;
    }
    vl.index = index;
    this.itemList[index] = vl;
    this.items[key] = vl;
    return vl;
  }

  clear() {
    this.items = {};
    this.itemList = [];
  }
  del(key: string): void {
    if (this.has(key)) {
      const index = this.items[key].index;
      if (index > -1) {
        this.itemList.splice(index, 1);
      }
      delete this.items[key];
      this.resetIndex();
    }
  }

  /**
   * 不包含当前index
   * @param index
   */
  delFrom(index: number) {
    for (let i = index + 1; i < this.count(); i++) {
      const key = this.itemList[i].key;
      delete this.items[key];
    }
    this.itemList.splice(index + 1, this.count() - index);
    this.resetIndex();
  }

  resetIndex(): void {
    this.foreachHashv((k: any, v: HashValue<T>) => {
      const index = this.itemList.indexOf(v);
      this.items[k].index = index;
    });
  }

  has(key: string): boolean {
    return key in this.items;
  }

  get(key: string): T | null {
    if (this.has(key)) {
      return this.items[key].value;
    }
    return null;
  }

  count(): number {
    return this.itemList.length;
  }

  all(): Array<T> {
    return this.itemList.map(vl => {
      return vl.value;
    });
  }
  first(): T {
    return this.itemList[0].value;
  }
  last(): T {
    return this.itemList[this.itemList.length - 1].value;
  }
  getByIndex(index: number): T {
    return this.itemList[index].value;
  }

  getKeyByIndex(index: number): string {
    return this.itemList[index].key;
  }

  //遍历 扩展
  foreach(callback: (key: string, value: T) => boolean | void) {
    for (const key in this.items) {
      const returnVal = callback(key, this.items[key].value);
      if (returnVal === false) {
        return false;
      }
    }
    return true;
  }
  private foreachHashv(callback: (key: string, value: HashValue<T>) => boolean | void) {
    for (const key in this.items) {
      const returnVal = callback(key, this.items[key]);
      if (returnVal === false) {
        return false;
      }
    }
    return true;
  }
  hasValue(value: any): boolean {
    for (const key in this.items) {
      if (this.items[key].value === value) {
        return true;
      }
    }
    return false;
  }
  //获取index
  indexOf(key: any): number {
    if (this.has(key)) {
      return this.items[key].index;
    }
    return -1;
  }

  //插入
  insertAt(index: number, value: T, key: string) {
    const hashV = new HashValue<T>();

    hashV.index = index;
    hashV.key = key;
    hashV.value = value;
    this.itemList.splice(index, 0, hashV);
    this.items[key] = hashV;
    this.resetIndex();
  }

  sort(callback: LooseFunction) {
    return this.itemList.sort((a: HashValue<T>, b: HashValue<T>) => {
      return callback(a.value, b.value);
    });
  }
  toArray(): Array<T> {
    return this.itemList.slice(0, this.itemList.length).map(vl => {
      return vl.value;
    });
  }
  push(lists: HashTable<any>) {
    lists.foreach((key: string, value: T) => {
      this.set(key, value);
    });
  }
  mapKey(): string[] {
    const returnArr: string[] = [];
    for (const key in this.items) {
      returnArr.push(key);
    }
    return returnArr;
  }

  toImmutableMap() {
    // do nothing
  }
}
