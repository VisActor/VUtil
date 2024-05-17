import { isDataView, DataView, DataSet } from '../src';

describe('Dataview', () => {
  it('isDataView', () => {
    const dt = new DataSet();

    expect(isDataView(new DataView(dt))).toBeTruthy();
    expect(isDataView({})).toBeFalsy();
  });
});
