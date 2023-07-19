/* Adapted from vega by University of Washington Interactive Data Lab
 * https://vega.github.io/vega/
 * Licensed under the BSD-3-Clause

 * url: https://github.com/vega/vega/blob/main/packages/vega-util/src/logger.js
 * License: https://github.com/vega/vega/blob/main/LICENSE
 * @license
 */

import { isNumber } from './common';
import type { ILogger } from './type';

const hasConsole = typeof console !== 'undefined';

function log(method: string, level: any, input: any) {
  const args = [level].concat([].slice.call(input));

  if (hasConsole) {
    // eslint-disable-next-line prefer-spread, no-undef
    console[method].apply(console, args); // eslint-disable-line no-console
  }
}

export enum LoggerLevel {
  None = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4
}

type ErrorHandler = (...args: any[]) => void;

export class Logger implements ILogger {
  private static _instance: ILogger = null;

  static getInstance(level?: number, method?: string) {
    if (Logger._instance && isNumber(level)) {
      Logger._instance.level(level);
    } else if (!Logger._instance) {
      Logger._instance = new Logger(level, method);
    }
    return Logger._instance;
  }
  static setInstance(logger: ILogger) {
    return (Logger._instance = logger);
  }

  static setInstanceLevel(level: number) {
    if (Logger._instance) {
      Logger._instance.level(level);
    } else {
      Logger._instance = new Logger(level);
    }
  }

  static clearInstance() {
    Logger._instance = null;
  }

  private _level: number;

  private _method: string;

  private _onErrorHandler: ErrorHandler[] = [];

  constructor(level: number = LoggerLevel.None, method?: string) {
    this._level = level;
    this._method = method;
  }

  addErrorHandler(handler: ErrorHandler) {
    if (this._onErrorHandler.find(h => h === handler)) {
      return;
    }
    this._onErrorHandler.push(handler);
  }

  removeErrorHandler(handler: ErrorHandler) {
    const index = this._onErrorHandler.findIndex(h => h === handler);
    if (index < 0) {
      return;
    }
    this._onErrorHandler.splice(index, 1);
  }

  callErrorHandler(...args: any[]) {
    this._onErrorHandler.forEach(h => h(args));
  }

  canLogInfo() {
    return this._level >= LoggerLevel.Info;
  }

  canLogDebug() {
    return this._level >= LoggerLevel.Debug;
  }

  canLogError() {
    return this._level >= LoggerLevel.Error;
  }

  canLogWarn() {
    return this._level >= LoggerLevel.Warn;
  }

  level(): number;
  level(levelValue: number): this;
  level(levelValue?: number) {
    if (arguments.length) {
      this._level = +levelValue;
      return this;
    }

    return this._level;
  }

  error(...args: any[]) {
    if (this._level >= LoggerLevel.Error) {
      if (this._onErrorHandler.length) {
        this.callErrorHandler(args);
      } else {
        log(this._method ?? 'error', 'ERROR', args);
      }
    }
    return this;
  }

  warn(...args: any[]) {
    if (this._level >= LoggerLevel.Warn) {
      log(this._method || 'warn', 'WARN', args);
    }
    return this;
  }

  info(...args: any[]) {
    if (this._level >= LoggerLevel.Info) {
      log(this._method || 'log', 'INFO', args);
    }
    return this;
  }

  debug(...args: any[]) {
    if (this._level >= LoggerLevel.Debug) {
      log(this._method || 'log', 'DEBUG', args);
    }
    return this;
  }
}
