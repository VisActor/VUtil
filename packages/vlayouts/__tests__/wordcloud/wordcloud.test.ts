/* Adapted from vega by University of Washington Interactive Data Lab
 * https://vega.github.io/vega/
 * Licensed under the BSD-3-Clause

 * url: https://github.com/vega/vega/blob/main/packages/vega-wordcloud/test/wordcloud-test.js
 * License: https://github.com/vega/vega/blob/main/LICENSE
 * @license
 */

import { wordcloudTransform as transform } from '../../src';
import { getMockCreateCanvas } from '../mock';

test('Wordcloud should not throw error when size is 0', async () => {
  const data = [
    { text: 'foo', size: 49, index: 0 },
    { text: 'bar', size: 36, index: 1 },
    { text: 'baz', size: 25, index: 2 },
    { text: 'abc', size: 1, index: 3 }
  ];

  const result = await transform(
    {
      size: [0, 0],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      fontSizeRange: [1, 7],
      createCanvas: getMockCreateCanvas()
    },
    data
  );

  expect(result).toEqual([]);
});

test('Wordcloud should not throw error when size is negative', async () => {
  const data = [
    { text: 'foo', size: 49, index: 0 },
    { text: 'bar', size: 36, index: 1 },
    { text: 'baz', size: 25, index: 2 },
    { text: 'abc', size: 1, index: 3 }
  ];

  const result = await transform(
    {
      size: [-10, 100],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      fontSizeRange: [1, 7],
      createCanvas: getMockCreateCanvas()
    },
    data
  );

  expect(result).toEqual([]);
});

test('Wordcloud should not throw error when size is very small', async () => {
  const data = [
    { text: 'foo', size: 49, index: 0 },
    { text: 'bar', size: 36, index: 1 },
    { text: 'baz', size: 25, index: 2 },
    { text: 'abc', size: 1, index: 3 }
  ];

  const result = await transform(
    {
      size: [10, 10],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      fontSizeRange: [1, 7],
      enlarge: true,
      createCanvas: getMockCreateCanvas()
    },
    data
  );

  expect(result).toEqual([]);
});

test('Wordcloud generates wordcloud layout', async () => {
  const data = [
    { text: 'foo', size: 49, index: 0 },
    { text: 'bar', size: 36, index: 1 },
    { text: 'baz', size: 25, index: 2 },
    { text: 'abc', size: 1, index: 3 }
  ];

  const result = await transform(
    {
      size: [500, 500],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      fontSizeRange: [1, 7],
      createCanvas: getMockCreateCanvas()
    },
    data
  );
  expect(result.length).toBe(data.length);
  expect(result[0].fontFamily).toBe('sans-serif');
  expect(result[0].fontSize).toBe(7);
  expect(result[0].fontStyle).toBe('normal');
  expect(result[0].fontWeight).toBe('normal');
  expect(result[0].x).toBe(250);
  expect(result[0].y).toBe(250);
});

test('Wordcloud generates wordcloud layout with negative data', async () => {
  const data = [
    { text: 'foo', size: -49, index: 0 },
    { text: 'bar', size: 36, index: 1 },
    { text: 'baz', size: 25, index: 2 },
    { text: 'abc', size: 1, index: 3 }
  ];

  const result = await transform(
    {
      size: [500, 500],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      fontSizeRange: [1, 7],
      createCanvas: getMockCreateCanvas()
    },
    data
  );
  expect(result.length).toBe(data.length);
  expect(result[0].fontFamily).toBe('sans-serif');
  expect(result[0].fontSize).toBe(7);
  expect(result[0].fontStyle).toBe('normal');
  expect(result[0].fontWeight).toBe('normal');
  expect(result[0].x).toBe(250);
  expect(result[0].y).toBe(250);
});

test('Wordcloud generates wordcloud layout with negative data and -domain[0] === domain[1]', async () => {
  const data = [
    { text: 'foo', size: -49, index: 0 },
    { text: 'bar', size: 49, index: 1 }
  ];

  const result = await transform(
    {
      size: [500, 500],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      fontSizeRange: [1, 7],
      createCanvas: getMockCreateCanvas()
    },
    data
  );
  expect(result.length).toBe(data.length);
  expect(result[0].fontFamily).toBe('sans-serif');
  expect(result[0].fontSize).toBe(7);
  expect(result[0].fontStyle).toBe('normal');
  expect(result[0].fontWeight).toBe('normal');
  expect(result[0].x).toBe(250);
  expect(result[0].y).toBe(250);
});

test('Wordcloud generates wordcloud layout with one data', async () => {
  const data = [{ text: 'foo', size: 49, index: 0 }];

  const result = await transform(
    {
      size: [500, 500],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      fontSizeRange: [1, 7],
      createCanvas: getMockCreateCanvas()
    },
    data
  );
  expect(result.length).toBe(data.length);
  expect(result[0].fontFamily).toBe('sans-serif');
  expect(result[0].fontSize).toBe(7);
  expect(result[0].fontStyle).toBe('normal');
  expect(result[0].fontWeight).toBe('normal');
  expect(result[0].x).toBe(250);
  expect(result[0].y).toBe(250);
});

test('Wordcloud generates wordcloud layout with domain[0] == domain[1] & domain[0] < 0', async () => {
  const data = [
    { text: 'foo', size: -49, index: 0 },
    { text: 'bar', size: -49, index: 1 }
  ];

  const result = await transform(
    {
      size: [500, 500],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      fontSizeRange: [1, 7],
      createCanvas: getMockCreateCanvas()
    },
    data
  );
  expect(result.length).toBe(data.length);
  expect(result[0].fontFamily).toBe('sans-serif');
  expect(result[0].fontSize).toBe(1);
  expect(result[0].fontStyle).toBe('normal');
  expect(result[0].fontWeight).toBe('normal');
  expect(result[0].x).toBe(250);
  expect(result[0].y).toBe(250);
});

test('Wordcloud generates wordcloud layout with domain[0] == domain[1] & domain[0] > 0', async () => {
  const data = [
    { text: 'foo', size: 49, index: 0 },
    { text: 'bar', size: 49, index: 1 }
  ];

  const result = await transform(
    {
      size: [500, 500],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      fontSizeRange: [1, 7],
      createCanvas: getMockCreateCanvas()
    },
    data
  );
  expect(result.length).toBe(data.length);
  expect(result[0].fontFamily).toBe('sans-serif');
  expect(result[0].fontSize).toBe(1);
  expect(result[0].fontStyle).toBe('normal');
  expect(result[0].fontWeight).toBe('normal');
  expect(result[0].x).toBe(250);
  expect(result[0].y).toBe(250);
});

test('Wordcloud of 3d', () => {
  const data = [
    { text: 'foo', size: 49, index: 0 },
    { text: 'bar', size: 36, index: 1 },
    { text: 'baz', size: 25, index: 2 },
    { text: 'abc', size: 1, index: 3 }
  ];

  const result = transform(
    {
      size: [400, 400],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      fontSizeRange: [20, 40],
      postProjection: 'StereographicProjection',
      depth_3d: 10,
      createCanvas: getMockCreateCanvas()
    },
    data
  );

  expect(result.length).toBe(data.length);
  result.forEach((el: any) => {
    expect(el.z).not.toBeUndefined();
    expect(el.fontSize).toBeGreaterThanOrEqual(20);
    expect(el.fontSize).toBeLessThanOrEqual(40);
  });
});

test('Wordcloud generates wordcloud layout with rotate seed random', async () => {
  const data = [
    { text: 'foo', size: 49, index: 0 },
    { text: 'bar', size: 36, index: 1 },
    { text: 'baz', size: 25, index: 2 },
    { text: 'abc', size: 1, index: 3 }
  ];

  const result = await transform(
    {
      size: [500, 500],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      fontSizeRange: [1, 7],
      rotate: [0, 20, 30],
      randomVisible: false,
      createCanvas: getMockCreateCanvas()
    },
    data
  );
  expect(result.length).toBe(data.length);
  expect(result[0].fontSize).toBe(7);
  expect(result[0].x).toBe(250);
  expect(result[0].y).toBe(250);
});

test('Wordcloud layout when there is one data and make sure try count is 2', async () => {
  const data = [
    {
      '240829180619332': '健康',
      '240830104655019': '113'
    }
  ];

  const result = await transform(
    {
      size: [148, 69],
      text: { field: '240829180619332' },
      fontSize: { field: '240830104655019' },
      fontSizeRange: [10, 50],
      shape: 'square',
      randomVisible: false,
      shrink: true,
      enlarge: true,
      createCanvas: getMockCreateCanvas()
    },
    data
  );
  expect(result.length).toBe(data.length);
  expect(result[0].fontSize).toBeCloseTo(35.656656207978486);
  expect(result[0].x).toBeCloseTo(73.45271178843568);
  expect(result[0].y).toBeCloseTo(34.23038995965935);
});
