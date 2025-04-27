export const getMockCreateCanvas = () => {
  return ({ width, height }: { width?: number; height?: number; dpr?: number }) => {
    return {
      width: width ?? 0,
      height: height ?? 0,
      getContext: () => {
        return {
          scale: () => {
            //
          },
          translate: () => {
            //
          },
          rotate: () => {
            //
          },
          getImageData: () => {
            return [].fill(1000000);
          },
          fillText: () => {
            //
          },
          measureText: (text: string) => {
            return {
              width: `${text ?? ''}`.length * 12,
              height: 14
            };
          }
        };
      },
      setAttribute: (key: string, value: any) => {
        //
      }
    };
  };
};

export const getMockCreateImage = () => {
  return () => {
    //
  };
};

export const getMockGetTextBounds = () => {
  return () => {
    return {
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 0,
      width: () => 0,
      height: () => 0
    };
  };
};
