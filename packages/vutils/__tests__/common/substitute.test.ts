import { substitute } from '../../src';

describe('substitute', () => {
  it('substitute("value: {value}", datum)', () => {
    const datum = { value: 30 };
    expect(substitute('value: {value}', datum)).toEqual('value: 30');
  });
});
