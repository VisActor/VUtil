import { Logger, isNil } from '@visactor/vutils';
import type { WordCloudShapeOptions } from './interface';
import { Layout } from './layout';

export const transform = (options: WordCloudShapeOptions, upstreamData: any[], parameters?: any): any => {
  /** options 配置错误提示 */
  if (
    !options.size ||
    isNil(options.size[0]) ||
    isNil(options.size[1]) ||
    options.size[0] <= 0 ||
    options.size[1] <= 0
  ) {
    const logger = Logger.getInstance();
    logger.info('Wordcloud size dimensions must be greater than 0');
    // size非法不报错，不进行布局，ChartSpace层会有用户初始化size为0的情况
    return [];
  }
  /** size 处理, 如果是小数, segmentation 计算会有问题导致place陷入死循环 */
  options.size = [Math.ceil(options.size[0]), Math.ceil(options.size[1])];

  if (!options.shape) {
    Logger.getInstance().error('WordcloudShape shape must be specified.');
  }
  if (!options.text) {
    Logger.getInstance().error('WordcloudShape text must be specified.');
  }

  if (options.onBeforeLayout) {
    options.onBeforeLayout();
  }

  // 第一次数据流到这里data为空，如果不做判断，走到布局算法会报错
  if (!upstreamData || upstreamData.length === 0) {
    return [];
  }

  const layout = new Layout(options);

  layout.layout(upstreamData);

  if (layout.unfinished()) {
    return {
      progressive: layout
    };
  }
  return layout.output();
};
