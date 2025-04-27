import { isBase64, isValidUrl } from '@visactor/vutils';
import type { CreateImageFunction } from '../interface/wordcloud';

/**
 * 使用 ResourceLoader 加载图片
 */
export function loadImage(url: string, createImage: CreateImageFunction) {
  if (!url || (!isValidUrl(url) && !isBase64(url) && !url.startsWith('<svg'))) {
    return null;
  }
  return new Promise((resolve, reject) => {
    const imageMark = createImage({ image: url });
    const imgData = imageMark.resources?.get(url);

    if (imgData && imgData.state === 'success' && imgData.data) {
      resolve(imgData.data);
      return;
    }

    imageMark.successCallback = () => {
      if (imageMark) {
        const imgData = imageMark.resources?.get(url);
        if (imgData && imgData.state === 'success' && imgData.data) {
          resolve(imgData.data);
        } else {
          reject(new Error('image load failed: ' + url));
        }
      } else {
        reject(new Error('image load failed: ' + url));
      }
    };
    imageMark.failCallback = () => {
      reject(new Error('image load failed: ' + url));
    };
  });
}

/**
 * 使用 ResourceLoader 加载多个图片
 */
export function loadImages(urls: string[], createImage: CreateImageFunction) {
  return Promise.allSettled(urls.map(url => loadImage(url, createImage)));
}
