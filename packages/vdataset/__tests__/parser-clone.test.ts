import { DataSet, DataView, csvParser } from '../src';

describe('parser', () => {
  it('clone in parserOption', () => {
    const dataSet = new DataSet();
    dataSet.registerParser('csv', csvParser);
    const dataView = new DataView(dataSet, {
      name: 'test'
    });
    const data = [
      { x: 1, y: 2, c: { d: 3, e: 4 } },
      { x: 11, y: 12, c: { d: 13, e: 14 } },
      { x: 21, y: 22, c: { d: 23, e: 24 } }
    ];
    dataView.parse(data, {
      type: null,
      clone: true
    });
    expect(dataView.latestData.length).toEqual(3);
    expect(dataView.latestData).toEqual(data);
    expect(dataView.latestData[0] === data[0]).toEqual(false);
  });
});
