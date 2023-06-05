import { pickWithout } from '../../src';

describe('pickWithout', () => {
  it('pickWithout by string ', () => {
    const obj = { a: 1, b: 'b', c: [1, 2, 4] };

    expect(pickWithout(obj, ['a', 'b'])).toEqual({ c: obj.c });
    expect(pickWithout(obj, [])).toEqual(obj);
  });

  it('pickWithout by regExp ', () => {
    const obj = { a: 1, b: 'b', c: [1, 2, 4], onClick: 'a', onMouse: 'a' };

    expect(pickWithout(obj, [/^(on)/g])).toEqual({ a: 1, b: 'b', c: [1, 2, 4] });
  });
});
