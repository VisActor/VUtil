import { wordcloudShapeTransform as transform } from '../../src/';
import type { WordCloudShapeOptions } from '../../src/wordcloud-shape/interface';
import { getMockCreateCanvas, getMockCreateImage } from '../mock';

test('Wordcloud shape should return empty data when shape is wrong', async () => {
  const data = [
    { text: 'foo', size: 49, index: 0 },
    { text: 'bar', size: 36, index: 1 },
    { text: 'baz', size: 25, index: 2 },
    { text: 'abc', size: 1, index: 3 }
  ];
  const result = transform(
    {
      size: [500, 500],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      shape: 'test',
      createCanvas: getMockCreateCanvas(),
      createImage: getMockCreateImage()
    },
    data
  );
  expect(result).toEqual([]);
});

test('Wordcloud shape should return empty data when size is undefined', async () => {
  const data = [
    { text: 'foo', size: 49, index: 0 },
    { text: 'bar', size: 36, index: 1 },
    { text: 'baz', size: 25, index: 2 },
    { text: 'abc', size: 1, index: 3 }
  ];
  const result = transform(
    {
      size: undefined,
      text: { field: 'text' },
      fontSize: { field: 'size' },
      shape: 'test',
      createCanvas: getMockCreateCanvas(),
      createImage: getMockCreateImage()
    },
    data
  );
  expect(result).toEqual([]);
});

test('Wordcloud shape should return empty data when size is [0, 0]', async () => {
  const data = [
    { text: 'foo', size: 49, index: 0 },
    { text: 'bar', size: 36, index: 1 },
    { text: 'baz', size: 25, index: 2 },
    { text: 'abc', size: 1, index: 3 }
  ];
  const result = transform(
    {
      size: [0, 0],
      text: { field: 'text' },
      fontSize: { field: 'size' },
      shape: 'test',
      createCanvas: getMockCreateCanvas(),
      createImage: getMockCreateImage()
    },
    data
  );
  expect(result).toEqual([]);
});

const twoRegionOptions: WordCloudShapeOptions = {
  size: [226, 86],
  text: { field: 'text' },
  fontSize: { field: 'size' },
  fontSizeRange: [12, 24],
  fontFamily: 'monospace',
  shape: { type: 'geometric', shape: 'square' },
  importantWordCount: 2,
  textLayoutTimes: 0,
  fillingTimes: 0,
  random: false,
  createCanvas: getMockCreateCanvas(),
  createImage: getMockCreateImage(),
  onUpdateMaskCanvas: canvas => {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000';
    context.fillRect(2, 3, 118, 80);
    context.fillRect(132, 3, 90, 80);
  }
};

type LaidOutWord = { text: string; fontSize: number; visible: boolean };

test('Wordcloud shape hides a previously placed word if it no longer fits after enlarging', () => {
  // The priority words fit at double size. The long word only fits at its initial size.
  const longWord = 'M'.repeat(11);
  const result: LaidOutWord[] = transform(
    { ...twoRegionOptions, layoutMode: 'ensureMappingEnlarge', fontSizeEnlargeFactor: 2 },
    [
      { text: 'A', size: 24 },
      { text: 'BBB', size: 18 },
      { text: longWord, size: 12 }
    ]
  );

  expect(result.map(word => [word.text, word.fontSize, word.visible])).toEqual([
    ['A', 48, true],
    ['BBB', 36, true],
    [longWord, 24, false]
  ]);
});

test('Wordcloud shape hides a word that only fit before rolling back a global shrink', () => {
  // The oversized priority word forces a shrink and then a rollback.
  // The non-priority word fits only during the shrunk pass.
  const priorityWord = 'N'.repeat(40);
  const longWord = 'M'.repeat(23);
  const result: LaidOutWord[] = transform(
    { ...twoRegionOptions, layoutMode: 'ensureMapping', fontSizeShrinkFactor: 0.5, globalShinkLimit: 0.5 },
    [
      { text: 'A', size: 24 },
      { text: priorityWord, size: 18 },
      { text: longWord, size: 12 }
    ]
  );

  expect(result.map(word => [word.text, word.fontSize, word.visible])).toEqual([
    ['A', 24, true],
    [priorityWord, 18, false],
    [longWord, 12, false]
  ]);
});
