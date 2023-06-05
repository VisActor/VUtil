interface Threshold {
  CLEAN_THRESHOLD?: number;
  L_TIME?: number;
  R_COUNT?: number;
  R_TIMESTAMP_MAX_SIZE?: number;
}
// LRU清除
export class LRU {
  private static CLEAN_THRESHOLD = 1e3;
  private static L_TIME = 1000; // 1000ms以内
  private static R_COUNT = 1; // 使用次数为0
  private static R_TIMESTAMP_MAX_SIZE = 20; // timestamp最大长度

  static clearCache<TK, TV extends { timestamp: number[] }>(cache: Map<TK, TV>, params: Threshold): number {
    const { CLEAN_THRESHOLD = LRU.CLEAN_THRESHOLD, L_TIME = LRU.L_TIME, R_COUNT = LRU.R_COUNT } = params;
    if (cache.size < CLEAN_THRESHOLD) {
      return 0;
    }
    // 开始清理，清理最近1000ms内使用次数为0的缓存
    let clearNum = 0;
    const clear = (key: TK) => {
      clearNum++;
      cache.delete(key);
    };
    const now = Date.now();
    cache.forEach((item, key) => {
      if (item.timestamp.length < R_COUNT) {
        return clear(key);
      } // 最近使用次数小于R_COUNT，清除
      let useCount = 0;
      while (now - item.timestamp[item.timestamp.length - 1 - useCount] < L_TIME) {
        useCount++;
        if (useCount >= R_COUNT) {
          break;
        }
      }
      if (useCount < R_COUNT) {
        return clear(key);
      } // 最近L_TIME以内使用次数小于R_COUNT，清除
      // 清除L_TIME以外的key，避免数组过长
      while (now - item.timestamp[0] > L_TIME) {
        item.timestamp.shift();
      }
      return;
    });
    return clearNum;
  }

  static addLimitedTimestamp<T extends { timestamp: number[] }>(cacheItem: T, t: number, params: Threshold) {
    const { R_TIMESTAMP_MAX_SIZE = LRU.R_TIMESTAMP_MAX_SIZE } = params;
    if (cacheItem.timestamp.length > R_TIMESTAMP_MAX_SIZE) {
      // cacheItem.timestamp[cacheItem.timestamp.length-1] =
      cacheItem.timestamp.shift();
    }
    cacheItem.timestamp.push(t);
  }

  static clearTimeStamp<TK, TV extends { timestamp: number[] }>(cache: Map<TK, TV>, params: Threshold) {
    const { L_TIME = LRU.L_TIME } = params;
    const now = Date.now();
    cache.forEach(item => {
      while (now - item.timestamp[0] > L_TIME) {
        item.timestamp.shift();
      }
    });
  }

  static clearItemTimestamp<T extends { timestamp: number[] }>(cacheItem: T, params: Threshold) {
    const { L_TIME = LRU.L_TIME } = params;
    const now = Date.now();
    while (now - cacheItem.timestamp[0] > L_TIME) {
      cacheItem.timestamp.shift();
    }
  }
}
