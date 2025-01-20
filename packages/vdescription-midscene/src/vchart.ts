import type { IVChart } from '@visactor/vchart';
import { addCanvasTag, addInfoScript, showInfo, type IDescription } from './util';

export function addVChartDescription(vchart: IVChart, id: string, needShowInfo?: boolean) {
  const ca = vchart.getCanvas();
  addCanvasTag(ca, id);
  const info = getChartDescription(vchart);
  addInfoScript(info, id);

  needShowInfo && showInfo(info, ca);
}

function getChartDescription(vchart: IVChart) {
  const stage = vchart.getStage();
  const info: IDescription[] = [];
  stage.firstChild.firstChild.forEachChildren((item: any, index) => {
    if (item.name.startsWith('regionGroup_')) {
      info.push({
        rect: {
          x: item.globalAABBBounds.x1,
          y: item.globalAABBBounds.y1,
          width: item.globalAABBBounds.width(),
          height: item.globalAABBBounds.height()
        },
        description: `The chart region`
      });
      info.push(...getTextDescription(item, 'Text in the chart region'));
    } else if (item.name.startsWith('axis-bottom_')) {
      const axisInfo = getAxisDescription(item, 'bottom');
      info.push(...axisInfo);
    } else if (item.name.startsWith('axis-left_')) {
      const axisInfo = getAxisDescription(item, 'left');
      info.push(...axisInfo);
    } else if (item.name === 'legend') {
      const legendInfo = getLegendDescription(item);
      info.push(...legendInfo);
    } else if (item.name === 'title') {
      const titleInfo = getTitledDescription(item);
      info.push(...titleInfo);
    } else {
      info.push(...getTextDescription(item));
    }
  });
  return info;
}

function getTitledDescription(title: any) {
  const mainTitleItem = title.getChildByName('mainTitle', true);
  const subTitleItem = title.getChildByName('subTitle', true);

  return [
    {
      rect: {
        x: mainTitleItem.globalAABBBounds.x1,
        y: mainTitleItem.globalAABBBounds.y1,
        width: mainTitleItem.globalAABBBounds.width(),
        height: mainTitleItem.globalAABBBounds.height()
      },
      text: mainTitleItem.attribute.text.toString(),
      description: `The main title of this chart`
    },
    {
      rect: {
        x: subTitleItem.globalAABBBounds.x1,
        y: subTitleItem.globalAABBBounds.y1,
        width: subTitleItem.globalAABBBounds.width(),
        height: subTitleItem.globalAABBBounds.height()
      },
      text: subTitleItem.attribute.text.toString(),
      description: `The subtitle of this chart`
    }
  ];
}
function getLegendDescription(legendComponent: any) {
  const legendInfo: IDescription[] = [];
  // first legendItem
  const legendItem = legendComponent.getChildByName('legendItem', true);
  const legendContainer = legendItem.parent;
  legendContainer.forEachChildren((item: any) => {
    const bounds = item.globalAABBBounds;
    const label = item.getChildByName('legendItemLabel', true);

    const info = {
      rect: {
        x: bounds.x1,
        y: bounds.y1,
        width: bounds.width(),
        height: bounds.height()
      },
      text: label.attribute.text,
      description: `The legend item of '${label.attribute.text}'`
    };

    legendInfo.push(info);
  });

  // 获取图元信息
  return legendInfo;
}
function getAxisDescription(axisComponent: any, position: string) {
  const container = axisComponent.getChildByName('axis-label-container-layer-0', true);
  const axisInfo: IDescription[] = [];
  container.forEachChildren((item: any) => {
    const bounds = item.globalAABBBounds;
    const info = {
      rect: {
        x: bounds.x1,
        y: bounds.y1,
        width: bounds.width(),
        height: bounds.height()
      },
      text: item.attribute.text.toString(),
      description: `The ${position} axis label of '${item.attribute.text.toString()}'`
    };
    axisInfo.push(info);
  });
  return axisInfo;
}
function getTextDescription(component: any, customDescription?: string) {
  const infos: IDescription[] = [];
  component.forEachChildren((item: any) => {
    if (item.type === 'group') {
      const textInfo = getTextDescription(item);
      infos.push(...textInfo);
    } else if (item.type === 'text') {
      const bounds = item.globalAABBBounds;
      const info: IDescription = {
        rect: {
          x: bounds.x1,
          y: bounds.y1,
          width: bounds.width(),
          height: bounds.height()
        },
        text: item.attribute.text.toString()
      };
      if (customDescription) {
        info.description = customDescription;
      }
      infos.push(info);
    }
  });
  return infos;
}
