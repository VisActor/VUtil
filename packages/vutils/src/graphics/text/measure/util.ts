import type { ITextFontParams } from './interface';

// FIXME: from Canopus
export function getContextFont(text: Partial<ITextFontParams>, defaultAttr: Partial<ITextFontParams> = {}): string {
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
    fontSize +
    'px ' +
    (fontFamily ? fontFamily : 'sans-serif')
  );
}
