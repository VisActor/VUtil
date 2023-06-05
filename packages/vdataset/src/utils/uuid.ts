/**
 * 生成唯一ID。 如果提供了 prefix ，会被添加到ID前缀上。
 * @param prefix 默认 dataset
 * @returns
 */
let idIndex: number = 0;
const maxId = 100000000;
export function getUUID(prefix: string = 'dataset'): string {
  if (idIndex > maxId) {
    idIndex = 0;
  }
  return prefix + '_' + idIndex++;
}
