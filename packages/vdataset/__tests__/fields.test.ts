import { DataSet, DataView, csvParser } from '../src';

describe('parser', () => {
  it('set fields will change dataView fields', () => {
    const dataSet = new DataSet();
    dataSet.registerParser('csv', csvParser);
    const dataView = new DataView(dataSet, {
      name: 'test',
      fields: {
        sex: {
          domain: ['female']
        },
        value: {
          type: 'linear',
          sortIndex: 0
        }
      }
    });
    const csvData = `sex,value
female,600
female,500
male,450
male,550`;
    dataView.parse(csvData, {
      type: 'csv'
    });
    expect(dataView.latestData.length).toEqual(4);
    expect(dataView.latestData[0]).toEqual({ sex: 'female', value: '600' });
    expect(dataView.latestData[1]).toEqual({ sex: 'female', value: '500' });
    expect(dataView.latestData[2]).toEqual({ sex: 'male', value: '450' });
    expect(dataView.latestData[3]).toEqual({ sex: 'male', value: '550' });

    dataView.reRunAllTransform();
    expect(dataView.latestData.length).toEqual(2);
    expect(dataView.latestData[0]).toEqual({ sex: 'female', value: '500' });
    expect(dataView.latestData[1]).toEqual({ sex: 'female', value: '600' });

    dataView.setFields({
      sex: {
        domain: ['male']
      },
      value: {
        type: 'linear',
        // sortIndex: 0,
        // sortReverse: true,
        sort: 'desc'
      }
    });
    dataView.reRunAllTransform();
    expect(dataView.latestData.length).toEqual(2);
    expect(dataView.latestData[0]).toEqual({ sex: 'male', value: '550' });
    expect(dataView.latestData[1]).toEqual({ sex: 'male', value: '450' });

    dataView.setFields(null);
    expect(dataView.getFields()).toEqual(null);
    dataView.reRunAllTransform();
    expect(dataView.latestData.length).toEqual(4);
    expect(dataView.latestData[0]).toEqual({ sex: 'female', value: '600' });
    expect(dataView.latestData[1]).toEqual({ sex: 'female', value: '500' });
    expect(dataView.latestData[2]).toEqual({ sex: 'male', value: '450' });
    expect(dataView.latestData[3]).toEqual({ sex: 'male', value: '550' });
  });
});
