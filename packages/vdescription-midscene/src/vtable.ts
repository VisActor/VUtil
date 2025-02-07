import type { ListTable } from '@visactor/vtable';
import { addCanvasTag, addInfoScript, showInfo, type IDescription } from './util';

export function addVTableDescription(vtable: ListTable, id: string, needShowInfo?: boolean) {
  const ca = vtable.canvas;
  addCanvasTag(ca, id);
  const info = getTableDiscription(vtable);
  addInfoScript(info, id);

  needShowInfo && showInfo(info, ca);
}

function getTableDiscription(table: ListTable) {
  const info: IDescription[] = [];
  const scenegraph = table.scenegraph;
  const { tableGroup, colHeaderGroup, bodyGroup } = scenegraph;

  // 表格绘图区
  info.push({
    rect: {
      x: tableGroup.globalAABBBounds.x1,
      y: tableGroup.globalAABBBounds.y1,
      width: tableGroup.globalAABBBounds.width(),
      height: tableGroup.globalAABBBounds.height()
    },
    description: 'The table region'
  });

  // 表头
  colHeaderGroup.forEachChildren((column, index) => {
    if (column.type === 'group') {
      column.forEachChildren((cell: any) => {
        const { col, row } = cell;
        info.push({
          rect: {
            x: cell.globalAABBBounds.x1,
            y: cell.globalAABBBounds.y1,
            width: cell.globalAABBBounds.width(),
            height: cell.globalAABBBounds.height()
          },
          text: table.getCellOriginValue(col, row),
          description: `The header cell(col: ${col}, row: ${row}) of this table`
        });
      });
    }
  });

  // body
  bodyGroup.forEachChildren((column, index) => {
    if (column.type === 'group') {
      column.forEachChildren((cell: any) => {
        const { col, row } = cell;
        info.push({
          rect: {
            x: cell.globalAABBBounds.x1,
            y: cell.globalAABBBounds.y1,
            width: cell.globalAABBBounds.width(),
            height: cell.globalAABBBounds.height()
          },
          text: table.getCellOriginValue(col, row),
          description: `The body cell(col: ${col}, row: ${row}) of this table`
        });
      });
    }
  });

  return info;
}
