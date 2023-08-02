export const memoize = <T extends (...args: any) => any>(func: T) => {
  let lastArgs: any[] = null;
  let lastResult: any = null;

  return ((...args: any[]) => {
    if (lastArgs && args.every((val, i) => val === lastArgs[i])) {
      return lastResult;
    }

    lastArgs = args;
    lastResult = (func as any)(...args);

    return lastResult;
  }) as T;
};
