import * as Util from '../src';

describe('VisUtil', () => {
  test('export EventEmitter', () => {
    expect(Util.EventEmitter).not.toBeUndefined;
  });
});
