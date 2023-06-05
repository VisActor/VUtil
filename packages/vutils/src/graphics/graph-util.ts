interface ITextConfig {
  text: string;
  fontSize: number;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: number | string;
  fontFamily?: string;
}

function getContextFont({ fontStyle, fontVariant, fontWeight, fontSize, fontFamily }: ITextConfig): string {
  return (
    '' +
    (fontStyle ? fontStyle + ' ' : '') +
    (fontVariant ? fontVariant + ' ' : '') +
    (fontWeight ? fontWeight + ' ' : '') +
    (fontSize || 12) +
    'px ' +
    (fontFamily ? fontFamily : 'sans-serif')
  );
}

export class GraphicUtil {
  canvas?: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D | null;

  static instance?: GraphicUtil;

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas;
    if (canvas) {
      this.ctx = canvas.getContext('2d');
    }
  }
  setCanvas(canvas?: HTMLCanvasElement) {
    this.canvas = canvas;
    if (canvas) {
      this.ctx = canvas.getContext('2d');
    }
  }

  measureText(tc: ITextConfig) {
    if (!this.canvas) {
      console.warn('[warn] no canvas, measureText might be not accurate');
      return this.estimate(tc);
    }
    return this.measureTextByCanvas(tc);
  }

  private measureTextByCanvas(tc: ITextConfig): { width: number; height: number } {
    if (!this.ctx) {
      console.error('[error!!!]measureTextByCanvas can not be called without canvas');
      return { width: -1, height: tc.fontSize };
    }
    this.ctx.font = getContextFont(tc);
    return {
      width: this.ctx.measureText(tc.text).width,
      height: tc.fontSize
    };
  }

  private estimate({ text, fontSize }: ITextConfig): { width: number; height: number } {
    // 假设只有英文和中文字符
    let eCharLen = 0; // 英文字符
    let cCharLen = 0; // 中文字符
    // 判断ascii码，如果是
    for (let i = 0; i < text.length; i++) {
      text.charCodeAt(i) < 128 ? eCharLen++ : cCharLen++;
    }
    return {
      width: ~~(0.8 * eCharLen * fontSize + cCharLen * fontSize),
      height: fontSize
    };
  }

  static getDefaultUtils(canvas?: HTMLCanvasElement) {
    if (!GraphicUtil.instance) {
      GraphicUtil.instance = new GraphicUtil(canvas);
    }
    return GraphicUtil.instance;
  }
}
