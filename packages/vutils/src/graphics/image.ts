const parseUint8ToImageData = (buffer: Uint8Array, width: number, height: number): ImageData => {
  const clampBuffer = new Uint8ClampedArray(buffer);
  const flipClampBuffer = new Uint8ClampedArray(buffer.length);
  for (let i = height - 1; i >= 0; i--) {
    for (let j = 0; j < width; j++) {
      const sourceIdx = i * width * 4 + j * 4;
      const targetIdx = (height - i) * width * 4 + j * 4;
      flipClampBuffer[targetIdx] = clampBuffer[sourceIdx];
      flipClampBuffer[targetIdx + 1] = clampBuffer[sourceIdx + 1];
      flipClampBuffer[targetIdx + 2] = clampBuffer[sourceIdx + 2];
      flipClampBuffer[targetIdx + 3] = clampBuffer[sourceIdx + 3];
    }
  }
  return new ImageData(flipClampBuffer, width, height);
};

export { parseUint8ToImageData };
