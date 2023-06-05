export default function stringWidth(string: string, ambiguousCharacterIsNarrow: boolean = true) {
  if (typeof string !== 'string' || string.length === 0) {
    return 0;
  }

  string = stripAnsi(string);

  if (string.length === 0) {
    return 0;
  }

  string = string.replace(emojiRegex(), '  ');

  const ambiguousCharacterWidth = ambiguousCharacterIsNarrow ? 1 : 2;
  let width = 0;

  for (const character of string) {
    const codePoint = character.codePointAt(0)!;

    // Ignore control characters
    if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) {
      continue;
    }

    // Ignore combining characters
    if (codePoint >= 0x300 && codePoint <= 0x36f) {
      continue;
    }

    const code = eastAsianCharacterInfo(character);
    switch (code) {
      case 'F':
      case 'W':
        width += 2;
        break;
      case 'A':
        width += ambiguousCharacterWidth;
        break;
      default:
        width += 1;
    }
  }

  return width;
}

const stripAnsi = (string: string) => {
  if (typeof string !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
  }

  return string.replace(ansiRegex(), '');
};

const ansiRegex = ({ onlyFirst = false } = {}) => {
  const pattern = [
    // eslint-disable-next-line max-len
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))'
  ].join('|');

  return new RegExp(pattern, onlyFirst ? undefined : 'g');
};

export const eastAsianCharacterInfo = (character: string) => {
  let x = character.charCodeAt(0);
  let y = character.length === 2 ? character.charCodeAt(1) : 0;
  let codePoint = x;
  if (0xd800 <= x && x <= 0xdbff && 0xdc00 <= y && y <= 0xdfff) {
    x &= 0x3ff;
    y &= 0x3ff;
    codePoint = (x << 10) | y;
    codePoint += 0x10000;
  }

  if (
    0x3000 === codePoint ||
    (0xff01 <= codePoint && codePoint <= 0xff60) ||
    (0xffe0 <= codePoint && codePoint <= 0xffe6)
  ) {
    return 'F';
  }
  if (
    0x20a9 === codePoint ||
    (0xff61 <= codePoint && codePoint <= 0xffbe) ||
    (0xffc2 <= codePoint && codePoint <= 0xffc7) ||
    (0xffca <= codePoint && codePoint <= 0xffcf) ||
    (0xffd2 <= codePoint && codePoint <= 0xffd7) ||
    (0xffda <= codePoint && codePoint <= 0xffdc) ||
    (0xffe8 <= codePoint && codePoint <= 0xffee)
  ) {
    return 'H';
  }
  if (
    (0x1100 <= codePoint && codePoint <= 0x115f) ||
    (0x11a3 <= codePoint && codePoint <= 0x11a7) ||
    (0x11fa <= codePoint && codePoint <= 0x11ff) ||
    (0x2329 <= codePoint && codePoint <= 0x232a) ||
    (0x2e80 <= codePoint && codePoint <= 0x2e99) ||
    (0x2e9b <= codePoint && codePoint <= 0x2ef3) ||
    (0x2f00 <= codePoint && codePoint <= 0x2fd5) ||
    (0x2ff0 <= codePoint && codePoint <= 0x2ffb) ||
    (0x3001 <= codePoint && codePoint <= 0x303e) ||
    (0x3041 <= codePoint && codePoint <= 0x3096) ||
    (0x3099 <= codePoint && codePoint <= 0x30ff) ||
    (0x3105 <= codePoint && codePoint <= 0x312d) ||
    (0x3131 <= codePoint && codePoint <= 0x318e) ||
    (0x3190 <= codePoint && codePoint <= 0x31ba) ||
    (0x31c0 <= codePoint && codePoint <= 0x31e3) ||
    (0x31f0 <= codePoint && codePoint <= 0x321e) ||
    (0x3220 <= codePoint && codePoint <= 0x3247) ||
    (0x3250 <= codePoint && codePoint <= 0x32fe) ||
    (0x3300 <= codePoint && codePoint <= 0x4dbf) ||
    (0x4e00 <= codePoint && codePoint <= 0xa48c) ||
    (0xa490 <= codePoint && codePoint <= 0xa4c6) ||
    (0xa960 <= codePoint && codePoint <= 0xa97c) ||
    (0xac00 <= codePoint && codePoint <= 0xd7a3) ||
    (0xd7b0 <= codePoint && codePoint <= 0xd7c6) ||
    (0xd7cb <= codePoint && codePoint <= 0xd7fb) ||
    (0xf900 <= codePoint && codePoint <= 0xfaff) ||
    (0xfe10 <= codePoint && codePoint <= 0xfe19) ||
    (0xfe30 <= codePoint && codePoint <= 0xfe52) ||
    (0xfe54 <= codePoint && codePoint <= 0xfe66) ||
    (0xfe68 <= codePoint && codePoint <= 0xfe6b) ||
    (0x1b000 <= codePoint && codePoint <= 0x1b001) ||
    (0x1f200 <= codePoint && codePoint <= 0x1f202) ||
    (0x1f210 <= codePoint && codePoint <= 0x1f23a) ||
    (0x1f240 <= codePoint && codePoint <= 0x1f248) ||
    (0x1f250 <= codePoint && codePoint <= 0x1f251) ||
    (0x20000 <= codePoint && codePoint <= 0x2f73f) ||
    (0x2b740 <= codePoint && codePoint <= 0x2fffd) ||
    (0x30000 <= codePoint && codePoint <= 0x3fffd)
  ) {
    return 'W';
  }
  if (
    (0x0020 <= codePoint && codePoint <= 0x007e) ||
    (0x00a2 <= codePoint && codePoint <= 0x00a3) ||
    (0x00a5 <= codePoint && codePoint <= 0x00a6) ||
    0x00ac === codePoint ||
    0x00af === codePoint ||
    (0x27e6 <= codePoint && codePoint <= 0x27ed) ||
    (0x2985 <= codePoint && codePoint <= 0x2986)
  ) {
    return 'Na';
  }
  if (
    0x00a1 === codePoint ||
    0x00a4 === codePoint ||
    (0x00a7 <= codePoint && codePoint <= 0x00a8) ||
    0x00aa === codePoint ||
    (0x00ad <= codePoint && codePoint <= 0x00ae) ||
    (0x00b0 <= codePoint && codePoint <= 0x00b4) ||
    (0x00b6 <= codePoint && codePoint <= 0x00ba) ||
    (0x00bc <= codePoint && codePoint <= 0x00bf) ||
    0x00c6 === codePoint ||
    0x00d0 === codePoint ||
    (0x00d7 <= codePoint && codePoint <= 0x00d8) ||
    (0x00de <= codePoint && codePoint <= 0x00e1) ||
    0x00e6 === codePoint ||
    (0x00e8 <= codePoint && codePoint <= 0x00ea) ||
    (0x00ec <= codePoint && codePoint <= 0x00ed) ||
    0x00f0 === codePoint ||
    (0x00f2 <= codePoint && codePoint <= 0x00f3) ||
    (0x00f7 <= codePoint && codePoint <= 0x00fa) ||
    0x00fc === codePoint ||
    0x00fe === codePoint ||
    0x0101 === codePoint ||
    0x0111 === codePoint ||
    0x0113 === codePoint ||
    0x011b === codePoint ||
    (0x0126 <= codePoint && codePoint <= 0x0127) ||
    0x012b === codePoint ||
    (0x0131 <= codePoint && codePoint <= 0x0133) ||
    0x0138 === codePoint ||
    (0x013f <= codePoint && codePoint <= 0x0142) ||
    0x0144 === codePoint ||
    (0x0148 <= codePoint && codePoint <= 0x014b) ||
    0x014d === codePoint ||
    (0x0152 <= codePoint && codePoint <= 0x0153) ||
    (0x0166 <= codePoint && codePoint <= 0x0167) ||
    0x016b === codePoint ||
    0x01ce === codePoint ||
    0x01d0 === codePoint ||
    0x01d2 === codePoint ||
    0x01d4 === codePoint ||
    0x01d6 === codePoint ||
    0x01d8 === codePoint ||
    0x01da === codePoint ||
    0x01dc === codePoint ||
    0x0251 === codePoint ||
    0x0261 === codePoint ||
    0x02c4 === codePoint ||
    0x02c7 === codePoint ||
    (0x02c9 <= codePoint && codePoint <= 0x02cb) ||
    0x02cd === codePoint ||
    0x02d0 === codePoint ||
    (0x02d8 <= codePoint && codePoint <= 0x02db) ||
    0x02dd === codePoint ||
    0x02df === codePoint ||
    (0x0300 <= codePoint && codePoint <= 0x036f) ||
    (0x0391 <= codePoint && codePoint <= 0x03a1) ||
    (0x03a3 <= codePoint && codePoint <= 0x03a9) ||
    (0x03b1 <= codePoint && codePoint <= 0x03c1) ||
    (0x03c3 <= codePoint && codePoint <= 0x03c9) ||
    0x0401 === codePoint ||
    (0x0410 <= codePoint && codePoint <= 0x044f) ||
    0x0451 === codePoint ||
    0x2010 === codePoint ||
    (0x2013 <= codePoint && codePoint <= 0x2016) ||
    (0x2018 <= codePoint && codePoint <= 0x2019) ||
    (0x201c <= codePoint && codePoint <= 0x201d) ||
    (0x2020 <= codePoint && codePoint <= 0x2022) ||
    (0x2024 <= codePoint && codePoint <= 0x2027) ||
    0x2030 === codePoint ||
    (0x2032 <= codePoint && codePoint <= 0x2033) ||
    0x2035 === codePoint ||
    0x203b === codePoint ||
    0x203e === codePoint ||
    0x2074 === codePoint ||
    0x207f === codePoint ||
    (0x2081 <= codePoint && codePoint <= 0x2084) ||
    0x20ac === codePoint ||
    0x2103 === codePoint ||
    0x2105 === codePoint ||
    0x2109 === codePoint ||
    0x2113 === codePoint ||
    0x2116 === codePoint ||
    (0x2121 <= codePoint && codePoint <= 0x2122) ||
    0x2126 === codePoint ||
    0x212b === codePoint ||
    (0x2153 <= codePoint && codePoint <= 0x2154) ||
    (0x215b <= codePoint && codePoint <= 0x215e) ||
    (0x2160 <= codePoint && codePoint <= 0x216b) ||
    (0x2170 <= codePoint && codePoint <= 0x2179) ||
    0x2189 === codePoint ||
    (0x2190 <= codePoint && codePoint <= 0x2199) ||
    (0x21b8 <= codePoint && codePoint <= 0x21b9) ||
    0x21d2 === codePoint ||
    0x21d4 === codePoint ||
    0x21e7 === codePoint ||
    0x2200 === codePoint ||
    (0x2202 <= codePoint && codePoint <= 0x2203) ||
    (0x2207 <= codePoint && codePoint <= 0x2208) ||
    0x220b === codePoint ||
    0x220f === codePoint ||
    0x2211 === codePoint ||
    0x2215 === codePoint ||
    0x221a === codePoint ||
    (0x221d <= codePoint && codePoint <= 0x2220) ||
    0x2223 === codePoint ||
    0x2225 === codePoint ||
    (0x2227 <= codePoint && codePoint <= 0x222c) ||
    0x222e === codePoint ||
    (0x2234 <= codePoint && codePoint <= 0x2237) ||
    (0x223c <= codePoint && codePoint <= 0x223d) ||
    0x2248 === codePoint ||
    0x224c === codePoint ||
    0x2252 === codePoint ||
    (0x2260 <= codePoint && codePoint <= 0x2261) ||
    (0x2264 <= codePoint && codePoint <= 0x2267) ||
    (0x226a <= codePoint && codePoint <= 0x226b) ||
    (0x226e <= codePoint && codePoint <= 0x226f) ||
    (0x2282 <= codePoint && codePoint <= 0x2283) ||
    (0x2286 <= codePoint && codePoint <= 0x2287) ||
    0x2295 === codePoint ||
    0x2299 === codePoint ||
    0x22a5 === codePoint ||
    0x22bf === codePoint ||
    0x2312 === codePoint ||
    (0x2460 <= codePoint && codePoint <= 0x24e9) ||
    (0x24eb <= codePoint && codePoint <= 0x254b) ||
    (0x2550 <= codePoint && codePoint <= 0x2573) ||
    (0x2580 <= codePoint && codePoint <= 0x258f) ||
    (0x2592 <= codePoint && codePoint <= 0x2595) ||
    (0x25a0 <= codePoint && codePoint <= 0x25a1) ||
    (0x25a3 <= codePoint && codePoint <= 0x25a9) ||
    (0x25b2 <= codePoint && codePoint <= 0x25b3) ||
    (0x25b6 <= codePoint && codePoint <= 0x25b7) ||
    (0x25bc <= codePoint && codePoint <= 0x25bd) ||
    (0x25c0 <= codePoint && codePoint <= 0x25c1) ||
    (0x25c6 <= codePoint && codePoint <= 0x25c8) ||
    0x25cb === codePoint ||
    (0x25ce <= codePoint && codePoint <= 0x25d1) ||
    (0x25e2 <= codePoint && codePoint <= 0x25e5) ||
    0x25ef === codePoint ||
    (0x2605 <= codePoint && codePoint <= 0x2606) ||
    0x2609 === codePoint ||
    (0x260e <= codePoint && codePoint <= 0x260f) ||
    (0x2614 <= codePoint && codePoint <= 0x2615) ||
    0x261c === codePoint ||
    0x261e === codePoint ||
    0x2640 === codePoint ||
    0x2642 === codePoint ||
    (0x2660 <= codePoint && codePoint <= 0x2661) ||
    (0x2663 <= codePoint && codePoint <= 0x2665) ||
    (0x2667 <= codePoint && codePoint <= 0x266a) ||
    (0x266c <= codePoint && codePoint <= 0x266d) ||
    0x266f === codePoint ||
    (0x269e <= codePoint && codePoint <= 0x269f) ||
    (0x26be <= codePoint && codePoint <= 0x26bf) ||
    (0x26c4 <= codePoint && codePoint <= 0x26cd) ||
    (0x26cf <= codePoint && codePoint <= 0x26e1) ||
    0x26e3 === codePoint ||
    (0x26e8 <= codePoint && codePoint <= 0x26ff) ||
    0x273d === codePoint ||
    0x2757 === codePoint ||
    (0x2776 <= codePoint && codePoint <= 0x277f) ||
    (0x2b55 <= codePoint && codePoint <= 0x2b59) ||
    (0x3248 <= codePoint && codePoint <= 0x324f) ||
    (0xe000 <= codePoint && codePoint <= 0xf8ff) ||
    (0xfe00 <= codePoint && codePoint <= 0xfe0f) ||
    0xfffd === codePoint ||
    (0x1f100 <= codePoint && codePoint <= 0x1f10a) ||
    (0x1f110 <= codePoint && codePoint <= 0x1f12d) ||
    (0x1f130 <= codePoint && codePoint <= 0x1f169) ||
    (0x1f170 <= codePoint && codePoint <= 0x1f19a) ||
    (0xe0100 <= codePoint && codePoint <= 0xe01ef) ||
    (0xf0000 <= codePoint && codePoint <= 0xffffd) ||
    (0x100000 <= codePoint && codePoint <= 0x10fffd)
  ) {
    return 'A';
  }

  return 'N';
};

const emojiRegex = () => {
  // https://mths.be/emoji
  // eslint-disable-next-line max-len
  return /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26F9(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC3\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC08\uDC26](?:\u200D\u2B1B)?|[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE])))?))?|\uDC6F(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDD75(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC2\uDECE-\uDEDB\uDEE0-\uDEE8]|\uDD3C(?:\u200D[\u2640\u2642]\uFE0F?|\uD83C[\uDFFB-\uDFFF])?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83E\uDDD1))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
};
