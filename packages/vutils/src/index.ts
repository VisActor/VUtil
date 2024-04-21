import EventEmitter from 'eventemitter3';

/**
 * A high performance event emitter
 * @see {@link https://github.com/primus/eventemitter3}
 * @memberof PIXI.utils
 * @class EventEmitter
 */
export { EventEmitter };

export * from './common';

// data structure
export * from './data-structure';

// algorithm
export * from './lru';

// math
export * from './math';

// angle
export * from './angle';

// color
// TODO: 后续删除这个导出，避免引入不需要的内容
export * as ColorUtil from './color';

// methods about graphics
export * from './graphics';

// type
export * from './type';

// log
export * from './logger';

// padding
export * from './padding';

export * from './time';

// dom
export * from './dom';

export * from './geo';

export * from './color';

export * from './format/time';
export * from './format/number';

export * from './fmin';
