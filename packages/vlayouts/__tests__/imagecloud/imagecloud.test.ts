import { imagecloudTransform } from '../../src';
import { getMockCreateCanvas, getMockCreateImage } from '../mock';

test('imagecloud should indicate when size is invalid', async () => {
  const data = [{ image: 'https://visactor.io/logo.png' }];
  const result = imagecloudTransform(
    {
      size: [0, 0],
      image: { field: 'image' },
      createCanvas: getMockCreateCanvas(),
      createImage: getMockCreateImage()
    },
    data
  );
  expect(result).toEqual([]);
});
