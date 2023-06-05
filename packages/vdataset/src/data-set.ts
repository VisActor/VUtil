import { EventEmitter } from '@dp/vis-util';
import type { DataView } from './data-view';
import { getUUID } from './utils/uuid';
import type { Transform } from './transform';
import type { Parser } from './parser';

interface IDataSetOptions {
  name?: string;
}

/**
 * 数据集
 */
export class DataSet {
  isDataSet: boolean = true;

  /**
   * 已注册的 Transform（key-value 对）
   */
  transformMap: Record<string, any> = {};

  /**
   * 已注册的 Parser(key-value 对）
   */
  parserMap: Record<string, any> = {};

  /**
   * 所有挂在数据集上的数据视图（key-value 对）
   */
  dataViewMap: Record<string | number, DataView> = {};

  name: string;

  /**
   * 消息的监听与触发
   */
  target: any = new EventEmitter();

  /**
   * 多 DataView消息监听工具
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  _callMap: Map<Function, (...args: any[]) => void> = new Map();

  constructor(public options?: IDataSetOptions) {
    let name;
    if (options?.name) {
      name = options.name;
    } else {
      name = getUUID('dataset');
    }
    this.name = name;
  }

  /**
   * 根据name 获取 dataView
   * @param name - name
   */
  getDataView(name: string | number): DataView {
    return this.dataViewMap[name];
  }

  /**
   * 设置 dataView
   * @param name - 名称
   * @param dataView - data dataView
   */
  setDataView(name: string | number, dataView: DataView): void {
    if (this.dataViewMap[name]) {
      throw new Error(`Error: dataView ${name} 之前已存在，请重新命名`);
    }
    this.dataViewMap[name] = dataView;
  }

  /**
   * 移除 dataview
   * @param name
   */
  removeDataView(name: string | number) {
    this.dataViewMap[name] = null;

    delete this.dataViewMap[name];
  }

  /**
   * 注册一个数据解析器
   * @param name - 类型
   * @param parser - 解析逻辑
   */
  registerParser(name: string, parser: Parser): void {
    if (this.parserMap[name]) {
      console.warn(`Warn: transform ${name} 之前已注册，执行覆盖逻辑`);
    }
    this.parserMap[name] = parser;
  }

  /**
   * 移除 parser
   * @param name
   */
  removeParser(name: string) {
    this.parserMap[name] = null;
    delete this.parserMap[name];
  }

  /**
   * 根据名称获取数据解析器
   * @param name
   * @returns
   */
  getParser(name: string): Parser {
    return this.parserMap[name] || this.parserMap.default;
  }

  /**
   * 注册一个数据处理函数
   * @param name
   * @param transform
   */
  registerTransform(name: string, transform: Transform): void {
    if (this.transformMap[name]) {
      console.warn(`Warn: transform ${name} 之前已注册，执行覆盖逻辑`);
    }
    this.transformMap[name] = transform;
  }

  /**
   * 移除 transform
   * @param name
   */
  removeTransform(name: string) {
    this.transformMap[name] = null;
    delete this.transformMap[name];
  }

  /**
   * 根据名称获取数据处理函数
   * @param name
   * @returns
   */
  getTransform(name?: string): Transform {
    return this.transformMap[name];
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  multipleDataViewAddListener(list: DataView[], event: string, call: Function) {
    let callAd = this._callMap.get(call);
    if (!callAd) {
      callAd = () => {
        if (list.some(l => l.isRunning)) {
          return;
        }
        call();
      };
    }
    list.forEach(l => {
      l.target.addListener(event, callAd);
    });
    this._callMap.set(call, callAd);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  multipleDataViewRemoveListener(list: DataView[], event: string, call: Function) {
    const callAd = this._callMap.get(call);
    if (callAd) {
      list.forEach(l => {
        l.target.removeListener(event, callAd);
      });
    }
    this._callMap.delete(call);
  }

  destroy() {
    this.transformMap = null;
    this.parserMap = null;
    this.dataViewMap = null;
    this._callMap = null;
    this.target.removeAllListeners();
  }
}
