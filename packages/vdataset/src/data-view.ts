import { cloneDeep, EventEmitter, merge, isNil } from '@visactor/vutils';
import type { DataSet } from './data-set';
import type { ITransformOptions } from './transform';
import type { DATAVIEW_TYPE } from './constants';
import { getUUID } from './utils/uuid';
import type { IParserOptions } from './parser';
import { fields } from './transform/fields';
export interface IDataViewOptions {
  name?: string | number; // dataview 名称
  history?: boolean; // 是否启用 historyData 字段存储全部历史变化数据，默认false 不存储
  diffKeys?: string[]; //  用于指定该数据视图监听的 `states` 状态量的。默认监听所有状态量（也就是任何状态量变更都会导致数据视图重新计算），如果指定为空数组 []，则不监听任何状态量，如果指定为非空数组，则只监听数组元素对应的状态量变更。
  fields?: IFields;
}

export interface IFieldsMeta {
  type?: 'ordinal' | 'linear';
  domain?: any[];
  sortIndex?: number;
  sortReverse?: boolean;
  [key: string]: unknown;
}

export interface IFields {
  [key: string]: IFieldsMeta;
}

export const DataViewDiffRank = '_data-view-diff-rank';

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
  historyData: any[] = [];

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

  // diff用数据id
  private _diffData: boolean = false;
  private _diffKeys: string[] = null;
  _diffMap: Map<string, any> = new Map();
  _diffRank: number = 0;

  // tag

  latestDataAUD: {
    add: any;
    update: any;
    del: any;
  };

  constructor(
    public dataSet: DataSet,
    public options?: IDataViewOptions
  ) {
    let name;
    if (options?.name) {
      name = options.name;
    } else {
      name = getUUID('dataview');
    }
    this.name = name;

    if (options?.history) {
      this.history = options.history;
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
    const cloneData = this.cloneParseData(data, options);
    if (options?.type) {
      this.parseOption = options;
      options = cloneDeep(options);
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
        const lastTag = this.isLastTransform(options);
        options = cloneDeep(options);
        this.executeTransform(options);
        if (lastTag) {
          this.diffLastData();
        }
      }
    }
    // 每次新增transform都要进行一次排序
    this.sortTransform();
    this.isRunning = false;
    return this;
  }
  private isLastTransform(options: ITransformOptions) {
    return this.transformsArr[this.transformsArr.length - 1] === options;
  }

  sortTransform() {
    this.transformsArr.sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
  }

  private executeTransform(
    options: ITransformOptions,
    opt: { pushHistory: boolean; emitMessage: boolean } = {
      pushHistory: true,
      emitMessage: true
    }
  ) {
    const { pushHistory, emitMessage } = opt;
    const transformFn = this.dataSet.getTransform(options.type);
    const transformData = transformFn(this.latestData, options.options);

    if (this.history && pushHistory !== false) {
      this.historyData.push(transformData);
    }

    this.latestData = transformData;
    emitMessage !== false && this.target.emit('change', []);
  }

  private resetTransformData() {
    this.latestData = this.parserData;
    if (this.history) {
      this.historyData.length = 0;
      this.historyData.push(this.rawData, this.parserData);
    }
  }

  reRunAllTransform = (
    opt: { pushHistory: boolean; emitMessage: boolean } = {
      pushHistory: true,
      emitMessage: true
    }
  ) => {
    this.isRunning = true;
    this.resetTransformData();
    this.transformsArr.forEach(t => {
      this.executeTransform(t, { ...opt, emitMessage: false });
      if (this.isLastTransform(t)) {
        this.diffLastData();
      }
    });
    this.isRunning = false;
    opt?.emitMessage !== false && this.target.emit('change', []);
    return this;
  };

  enableDiff(keys: string[]) {
    this._diffData = true;
    this._diffKeys = keys;
  }

  disableDiff() {
    this._diffData = false;
    this.resetDiff();
  }

  resetDiff() {
    this._diffMap = new Map();
    this._diffRank = 0;
  }

  protected diffLastData() {
    if (!this._diffData) {
      return;
    }
    if (!this.latestData.forEach) {
      return;
    }
    if (!this._diffKeys?.length) {
      return;
    }
    const next = this._diffRank + 1;
    if (this._diffRank === 0) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      this.latestData.forEach((d: Object) => {
        d[DataViewDiffRank] = next;
        this._diffMap.set(
          this._diffKeys.reduce((pre, k) => pre + d[k], ''),
          d
        );
      });
      this.latestDataAUD = {
        add: Array.from(this.latestData),
        del: [],
        update: []
      };
    } else {
      this.latestDataAUD = {
        add: [],
        del: [],
        update: []
      };
      let tempKey;
      // eslint-disable-next-line @typescript-eslint/ban-types
      this.latestData.forEach((d: Object) => {
        d[DataViewDiffRank] = next;
        tempKey = this._diffKeys.reduce((pre, k) => pre + d[k], '');
        if (this._diffMap.get(tempKey)) {
          this.latestDataAUD.update.push(d);
        } else {
          this.latestDataAUD.add.push(d);
        }
        this._diffMap.set(tempKey, d);
      });
      this._diffMap.forEach((v, k) => {
        if (v[DataViewDiffRank] < next) {
          this.latestDataAUD.del.push(v);
          this._diffMap.delete(k);
        }
      });
    }
    this._diffRank = next;
  }

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
    this.resetDiff();
    this.latestData = null;
    this.rawData = null;
    this.parserData = null;
    this.transformsArr = null;
    this.target = null;
  }
}
