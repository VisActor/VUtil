import { cloneDeep } from '@visactor/vutils';
import { isDataView, DataView, DataSet, csvParser, dataViewParser, statistics } from '../src';

/**
 * 聚合统计主要用于处理数据(诸如统计平均值,求和等),并返回计算后的数据结果
 * @param data
 * @param options
 * @returns
 */
export interface ICopyDataViewOption {
  deep?: boolean;
}
function copyOneDataView(d: DataView, deep = false) {
  let _deep = deep;
  if (d.latestData instanceof DataView) {
    _deep = false;
  }
  if (_deep) {
    return cloneDeep(d.latestData);
  }

  return d.latestData && d.latestData.slice();
}
export const copyDataView = (data: Array<DataView>, options?: ICopyDataViewOption) => {
  if (data.length === 0) {
    return [];
  }
  if (data.length === 1) {
    return copyOneDataView(data[0], options?.deep);
  }
  return data.map(d => copyOneDataView(d, options?.deep));
};

describe('Dataview', () => {
  it('isDataView', () => {
    const dt = new DataSet();

    expect(isDataView(new DataView(dt))).toBeTruthy();
    expect(isDataView({})).toBeFalsy();
  });

  it('statistics in csv data', () => {
    const dataSet = new DataSet();
    // 注册 parser，transform
    dataSet.registerParser('csv', csvParser);
    dataSet.registerParser('dataview', dataViewParser);
    dataSet.registerTransform('statistics', statistics);
    dataSet.registerTransform('copyDataView', copyDataView);

    // 2份原始数据
    const dataLess50 = `year,group,value
1990,18-34,16.9
1990,35-49,12.2
1991,18-34,17
1991,35-49,17.8
1993,18-34,26.5
1993,35-49,23.8
`;
    const dataOver50 = `year,group,value
1990,50-64,10.2
1990,65+,5.2
1991,50-64,10
1991,65+,4.8
1993,50-64,16.8
1993,65+,6.6
`;
    // 解析2分原始数据
    const dataView1 = new DataView(dataSet, { name: 'dataView1' });
    dataView1.parse(dataLess50, { type: 'csv' });
    const dataView2 = new DataView(dataSet, { name: 'dataView2' });
    dataView2.parse(dataOver50, { type: 'csv' });

    // 创建 dataViewMerge
    const dataViewMerge = new DataView(dataSet, { name: 'dataViewMerge' });
    // 令它引用 dataView1, dataView2
    dataViewMerge.parse([dataView1, dataView2], { type: 'dataview' });
    // 现在我们来自己实现一个 merge transform
    const mergeDataViewTransform = (data: DataView[]) => {
      // 此时我们接收的 data 是一个数组 data = [dataView1,dataView2]
      const result: any[] = [];
      data.forEach(d => {
        // dataView 的 latestData 属性就是它的最终数据
        result.push(...d.latestData);
      });
      return result;
    };
    // 注册 merge transform
    dataSet.registerTransform('mergeDataView', mergeDataViewTransform);
    // 使用 merge transform 合并数据
    dataViewMerge.transform({ type: 'mergeDataView' });

    /**
 * 至此，dataViewMerge 数据处理已经完成了。
 * 最终数据的内容如下
  [
    { year: '1990', group: '18-34', value: 16.9 },
    { year: '1990', group: '35-49', value: 12.2 },
    { year: '1991', group: '18-34', value: 17 },
    { year: '1991', group: '35-49', value: 17.8 },
    { year: '1993', group: '18-34', value: 26.5 },
    { year: '1993', group: '35-49', value: 23.8 },
    { year: '1990', group: '50-64', value: 10.2 },
    { year: '1990', group: '65+', value: 5.2 },
    { year: '1991', group: '50-64', value: 10 },
    { year: '1991', group: '65+', value: 4.8 },
    { year: '1993', group: '50-64', value: 16.8 },
    { year: '1993', group: '65+', value: 6.6 }
  ]
*/

    // 创建平均值数据 令它引用 dataViewMerge
    const dataViewAvg = new DataView(dataSet, { name: 'dataViewAvg' });
    dataViewAvg.parse([dataViewMerge], { type: 'dataview' });
    // 内置的 copy transform。从依赖的 dataView 上浅拷贝数据，只会重新创建数据数组，数据对象不变。
    dataViewAvg.transform({ type: 'copyDataView' });
    // 此时 dataViewAvg 与 dataViewMerge 中的数据内容相同
    // 内置的 statistics transform 可以生成统计数据
    dataViewAvg.transform({
      type: 'statistics',
      options: {
        fields: ['value'],
        operations: ['average'],
        as: ['avg'],
        groupBy: 'year'
      }
    });

    expect(dataViewAvg.latestData[1].average).toBe(12.4);
  });
});
