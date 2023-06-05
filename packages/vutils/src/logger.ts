function log(method: string, level: any, input: any) {
  const hasConsole = typeof console !== 'undefined';

  if (hasConsole) {
    const args = [level].concat([].slice.call(input));

    // eslint-disable-next-line prefer-spread
    console[method].apply(console, args); // eslint-disable-line no-console
  }
}

export const None = 0;
export const Error = 1;
export const Warn = 2;
export const Info = 3;
export const Debug = 4;

export function logger(logLevel: number, method: string) {
  let level = logLevel || None;
  return {
    level(levelValue: number) {
      if (arguments.length) {
        level = +levelValue;
        return this;
      }
      return level;
    },
    error(...args: any[]) {
      if (level >= Error) {
        log(method || 'error', 'ERROR', args);
      }
      return this;
    },
    warn(...args: any[]) {
      if (level >= Warn) {
        log(method || 'warn', 'WARN', args);
      }
      return this;
    },
    info(...args: any[]) {
      if (level >= Info) {
        log(method || 'log', 'INFO', args);
      }
      return this;
    },
    debug(...args: any[]) {
      if (level >= Debug) {
        log(method || 'log', 'DEBUG', args);
      }
      return this;
    }
  };
}
