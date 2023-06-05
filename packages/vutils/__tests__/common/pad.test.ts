import { pad } from '../../src';

describe('pad', () => {
  it('pad("abc", 6)', () => {
    expect(pad('abc', 6)).toBe('abc   ');
  });

  it('pad("abc", 6, "_-")', () => {
    expect(pad('abc', 6, '_-')).toBe('abc_-_-_-');
  });

  it('pad("abc", 2)', () => {
    expect(pad('abc', 2)).toBe('abc');
  });

  it('pad("abc", 6, " ", "left")', () => {
    expect(pad('abc', 6, ' ', 'left')).toBe('   abc');
  });

  it('pad("abc", 5, "_-", "left")', () => {
    expect(pad('abc', 5, '_-', 'left')).toBe('_-_-abc');
  });

  it('pad("abc", 2, " ", "left")', () => {
    expect(pad('abc', 2, ' ', 'left')).toBe('abc');
  });

  it('pad("abc", 8, " ", "center")', () => {
    expect(pad('abc', 8, ' ', 'center')).toBe('  abc   ');
  });

  it('pad("abc", 8, "_-", "center")', () => {
    expect(pad('abc', 8, '_-', 'center')).toBe('_-_-abc_-_-_-');
  });

  it('pad("abc", 2, " ", "center")', () => {
    expect(pad('abc', 2, ' ', 'center')).toBe('abc');
  });
});
