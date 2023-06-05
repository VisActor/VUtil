import { DataSet, DataView, csvParser } from '../src';

describe('parser', () => {
  it('csv-parser', () => {
    const dataSet = new DataSet();
    dataSet.registerParser('csv', csvParser);
    const dataView = new DataView(dataSet, { name: 'test' });
    const csvData = `sex,height,weight
女性,150,45.5
女性,152,52.5
女性,154.3,53.5
女性,161.6,53.5`;
    dataView.parse(csvData, {
      type: 'csv'
    });
    expect(dataView.latestData.length).toEqual(4);
    expect(dataView.latestData[0]).toEqual({ sex: '女性', height: '150', weight: '45.5' });
    expect(dataView.latestData[1]).toEqual({ sex: '女性', height: '152', weight: '52.5' });
    expect(dataView.latestData[2]).toEqual({ sex: '女性', height: '154.3', weight: '53.5' });
    expect(dataView.latestData[3]).toEqual({ sex: '女性', height: '161.6', weight: '53.5' });
  });
});
