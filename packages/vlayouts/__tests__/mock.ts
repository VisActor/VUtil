export const getMockCreateCanvas = () => {
  return ({ width, height }: { width?: number; height?: number; dpr?: number }) => {
    const canvas = document.createElement('canvas');

    if (width) {
      canvas.style.width = `${width}px`;
      canvas.width = width;
    }
    if (height) {
      canvas.style.height = `${height}px`;
      canvas.height = height;
    }

    return canvas;
  };
};

export const getMockCreateImage = () => {
  return () => {
    //
  };
};

export const getMockGetTextBounds = () => {
  return (attrs: { text?: string; x?: number; y?: number; fontSize?: number }) => {
    const { x = 0, y = 0, text = '', fontSize = 12 } = attrs;
    const width = fontSize * text.length * 0.5;

    return {
      x1: x,
      x2: x + width,
      y1: y,
      y2: y + fontSize,
      width: () => width,
      height: () => fontSize
    };
  };
};
