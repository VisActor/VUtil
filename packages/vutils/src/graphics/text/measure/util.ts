import type { ITextFontParams } from './interface';

// FIXME: from VRender
export function getContextFont(
  text: Partial<ITextFontParams>,
  defaultAttr: Partial<ITextFontParams> = {},
  fontSizeScale?: number
): string {
  if (!fontSizeScale) {
    fontSizeScale = 1;
  }
  const {
    fontStyle = defaultAttr.fontStyle,
    fontVariant = defaultAttr.fontVariant,
    fontWeight = defaultAttr.fontWeight,
    fontSize = defaultAttr.fontSize,
    fontFamily = defaultAttr.fontFamily
  } = text;
  return (
    '' +
    (fontStyle ? fontStyle + ' ' : '') +
    (fontVariant ? fontVariant + ' ' : '') +
    (fontWeight ? fontWeight + ' ' : '') +
    fontSize * fontSizeScale +
    'px ' +
    (fontFamily ? fontFamily : 'sans-serif')
  );
}
