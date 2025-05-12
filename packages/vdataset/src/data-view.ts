import { cloneDeep, EventEmitter, merge, isNil, isEqual } from '@visactor/vutils';
import type { DataSet } from './data-set';
import type { ITransformOptions } from './transform';
import type { DATAVIEW_TYPE } from './constants';
import { getUUID } from './utils/uuid';
import type { IParserOptions } from './parser';
import { fields } from './transform/fields';
export interface IDataViewOptions {
  name?: string | number; // dataview 名称
  history?: boolean; // 是否启用 historyData 字段存储全部历史变化数据，默认false 不存储
  fields?: IFields;
}

export interface IFieldsMeta {
  type?: 'ordinal' | 'linear';
  domain?: any[];
  sortIndex?: number;
  sortReverse?: boolean;
  /**
   * 排序简易配置
   * 当配置了 sort 时，sortIndex 默认为 0 ，sortReverse 跟随 sort 的值，'desc' 时为 true，'asc' 时为 false
   * 当配置了 sortIndex 和 sortReverser 时，优先级会高于 sort 的默认效果
   * @support since 1.0.4
   */
  sort?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface IFields {
  [key: string]: IFieldsMeta;
}

export interface DataViewTransformOptions {
  /**
   * 是否更新到历史数据中
   */
  pushHistory?: boolean;
  /**
   * 是否触发消息
   */
  emitMessage?: boolean;
  /**
   * 当数据相等的时候不触发 change 事件
   */
  skipEqual?: boolean;
}

/**
 * 数据视图
 * @public
 */
export class DataView {
  isDataView: boolean = true;

  type: DATAVIEW_TYPE;

  name: string | number;

  target: any = new EventEmitter();

  /**
   * 当前parser
   */
  parseOption: IParserOptions = null;

  /**
   * 已应用的 transform
   */
  transformsArr: Array<ITransformOptions> = [];

  /**
   * 是否正在运行 parse 和 transform
   */
  isRunning: boolean = false;

  /**
   * 原始数据
   */
  rawData: any = {};

  history: boolean = false;
  /**
   * 中间态数据，默认 history false 不存储
   */
  historyData: any[];

  /**
   * parser后的数据
   */
  parserData: any = {};

  /**
   * 最终数据
   */
  latestData: any = {};

  /**
   * 数据维度信息
   */
  protected _fields: IFields = null;

  // tag

  latestDataAUD: {
    add: any;
    update: any;
    del: any;
  };

  constructor(public dataSet: DataSet, public options?: IDataViewOptions) {
    let name;
    if (options?.name) {
      name = options.name;
    } else {
      name = getUUID('dataview');
    }
    this.name = name;

    if (options?.history) {
      this.history = options.history;
      this.historyData = [];
    }

    this.dataSet.setDataView(name, this);
    this.setFields(options?.fields);
  }

  /**
   * 解析数据
   * todo: parse instanceof DataView
   * todo: parse ['dataview1', 'dataview2']
   * @param data
   * @param options
   * @returns
   */
  parse(data: any, options?: IParserOptions, emit: boolean = false): DataView {
    this.isRunning = true;
    if (emit) {
      this.target.emit('beforeParse', []);
    }
    options && (this.parseOption = options);
    const cloneData = this.cloneParseData(data, options);
    if (options?.type) {
      // 默认bytejson
      const parserFn = this.dataSet.getParser(options.type) ?? this.dataSet.getParser('bytejson');

      const parserData = parserFn(cloneData, options.options, this);

      this.rawData = cloneData;
      this.parserData = parserData;

      if (this.history) {
        this.historyData.push(cloneData, parserData);
      }

      this.latestData = parserData;
    } else {
      this.parserData = cloneData;
      this.rawData = cloneData;

      if (this.history) {
        this.historyData.push(cloneData);
      }
      this.latestData = cloneData;
    }

    this.isRunning = false;
    if (emit) {
      this.target.emit('afterParse', []);
    }
    return this;
  }
  /**
   *  执行数据处理数据
   * @param options
   */
  transform(options: ITransformOptions, execute: boolean = true): DataView {
    this.isRunning = true;
    if (options && options.type) {
      // special transform
      let pushOption = true;
      if (options.type === 'fields') {
        this._fields = options.options.fields;
        // make sure only one fields
        const index = this.transformsArr.findIndex(_op => _op.type === options.type);
        if (index >= 0) {
          pushOption = false;
          this.transformsArr[index].options.fields = this._fields;
        }
      }
      pushOption && this.transformsArr.push(options);
      if (execute) {
        this.executeTransform(options);
      }
    }
    // 每次新增transform都要进行一次排序
    this.sortTransform();
    this.isRunning = false;
    return this;
  }

  sortTransform() {
    if (this.transformsArr.length >= 2) {
      this.transformsArr.sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
    }
  }

  private executeTransform(options: ITransformOptions, opt: DataViewTransformOptions = {}) {
    const { pushHistory, emitMessage, skipEqual } = opt;
    const transformFn = this.dataSet.getTransform(options.type);
    const prevLatestData = this.latestData;
    const transformData = transformFn(prevLatestData, options.options);

    if (this.history && pushHistory !== false) {
      this.historyData.push(transformData);
    }

    this.latestData = transformData;

    if (emitMessage !== false && (!skipEqual || !isEqual(prevLatestData, this.latestData))) {
      this.target.emit('change', { latestData: this.latestData });
    }
  }

  private resetTransformData() {
    this.latestData = this.parserData;
    if (this.history) {
      this.historyData.length = 0;
      this.historyData.push(this.rawData, this.parserData);
    }
  }

  reRunAllTransform = (opt: DataViewTransformOptions = {}) => {
    const prevLatestData = this.latestData;

    this.isRunning = true;
    this.resetTransformData();
    this.transformsArr.forEach(t => {
      this.executeTransform(t, { pushHistory: opt.pushHistory, emitMessage: false });
    });
    this.isRunning = false;

    if (opt.emitMessage !== false && (!opt.skipEqual || !isEqual(prevLatestData, this.latestData))) {
      this.target.emit('change', { latestData: this.latestData });
    }

    return this;
  };

  private cloneParseData(data: any, options?: IParserOptions) {
    let clone = false;
    if (!(data instanceof DataView) && options?.clone === true) {
      clone = true;
    }
    return clone ? cloneDeep(data) : data;
  }

  parseNewData(data: any, options?: IParserOptions) {
    this.parse(data, options || this.parseOption);
    this.reRunAllTransform();
  }

  updateRawData(data: any, options?: IParserOptions) {
    const cloneData = this.cloneParseData(data, options);
    this.rawData = cloneData;
    this.parserData = cloneData;
    this.latestData = cloneData;
    this.reRunAllTransform();
  }

  // updateParseData(data: any) {
  //   // this.parse(data, this.parseOption);
  //   this.parserData = data;
  //   this.reRunAllTransform();
  // }
  // AddParseData(data: any) {
  //   this.parse(data, this.parseOption);
  //   this.reRunAllTransform();
  // }
  // RemParseData(data: any) {
  //   this.parse(data, this.parseOption);
  //   this.reRunAllTransform();
  // }

  markRunning = () => {
    this.isRunning = true;
    this.target.emit('markRunning', []);
  };

  getFields() {
    if (this._fields) {
      return this._fields;
    }
    if (this.parseOption?.type === 'dataview' && this.rawData.length === 1 && this.rawData[0].getFields) {
      return this.rawData[0].getFields();
    }
    return null;
  }

  setFields(f: IFields, foreMerge: boolean = false) {
    if (f && foreMerge) {
      this._fields = merge({}, this._fields, f);
    } else {
      this._fields = f;
    }

    const fieldsOption = this.transformsArr.find(_op => _op.type === 'fields');
    if (!isNil(this._fields) && isNil(fieldsOption)) {
      // add
      this.dataSet.registerTransform('fields', fields);
      this.transform(
        {
          type: 'fields',
          options: {
            fields: this._fields
          }
        },
        false
      );
    } else if (fieldsOption) {
      // update
      fieldsOption.options.fields = this._fields;
    }
  }

  destroy() {
    this.dataSet.removeDataView(this.name);
    this.latestData = null;
    this.rawData = null;
    this.parserData = null;
    this.transformsArr = null;
    this.target = null;
  }
}

export function isDataView(obj: any): obj is DataView {
  return obj instanceof DataView;
}
