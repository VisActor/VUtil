export type ArcAnchorType =
  | 'inner-start'
  | 'inner-end'
  | 'inner-middle'
  | 'outer-start'
  | 'outer-end'
  | 'outer-middle'
  | 'center';
export type IArcLikeAttr = {
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
};
export const calculateAnchorOfArc = (arcAttr: IArcLikeAttr, anchorType: ArcAnchorType) => {
  const { startAngle, endAngle, innerRadius, outerRadius } = arcAttr;
  let angle = (startAngle + endAngle) / 2;
  let radius = (innerRadius + outerRadius) / 2;

  switch (anchorType) {
    case 'inner-start':
      angle = startAngle;
      radius = innerRadius;
      break;
    case 'outer-start':
      angle = startAngle;
      radius = outerRadius;
      break;
    case 'inner-end':
      angle = endAngle;
      radius = innerRadius;
      break;
    case 'outer-end':
      angle = endAngle;
      radius = outerRadius;
      break;
    case 'inner-middle':
      radius = innerRadius;
      break;
    case 'outer-middle':
      radius = outerRadius;
      break;
  }
  return { angle, radius };
};
