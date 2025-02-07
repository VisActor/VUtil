// import type {ISpec} from '@visactor/vchart';
// import { VChart} from '@visactor/vchart';
// import { createDiv } from './utils/dom';
// import { addVChartDescription } from '../src';

// const spec: ISpec = {
//   type: 'line',
//   data: {
//     values: [
//       { type: 'Nail polish', country: 'Africa', value: 4229 },
//       { type: 'Nail polish', country: 'EU', value: 4376 },
//       { type: 'Nail polish', country: 'China', value: 3054 },
//       { type: 'Nail polish', country: 'USA', value: 12814 },
//       { type: 'Eyebrow pencil', country: 'Africa', value: 3932 },
//       { type: 'Eyebrow pencil', country: 'EU', value: 3987 },
//       { type: 'Eyebrow pencil', country: 'China', value: 5067 },
//       { type: 'Eyebrow pencil', country: 'USA', value: 13012 },
//       { type: 'Rouge', country: 'Africa', value: 5221 },
//       { type: 'Rouge', country: 'EU', value: 3574 },
//       { type: 'Rouge', country: 'China', value: 7004 },
//       { type: 'Rouge', country: 'USA', value: 11624 },
//       { type: 'Lipstick', country: 'Africa', value: 9256 },
//       { type: 'Lipstick', country: 'EU', value: 4376 },
//       { type: 'Lipstick', country: 'China', value: 9054 },
//       { type: 'Lipstick', country: 'USA', value: 8814 },
//       { type: 'Eyeshadows', country: 'Africa', value: 3308 },
//       { type: 'Eyeshadows', country: 'EU', value: 4572 },
//       { type: 'Eyeshadows', country: 'China', value: 12043 },
//       { type: 'Eyeshadows', country: 'USA', value: 12998 },
//       { type: 'Eyeliner', country: 'Africa', value: 5432 },
//       { type: 'Eyeliner', country: 'EU', value: 3417 },
//       { type: 'Eyeliner', country: 'China', value: 15067 },
//       { type: 'Eyeliner', country: 'USA', value: 12321 },
//       { type: 'Foundation', country: 'Africa', value: 13701 },
//       { type: 'Foundation', country: 'EU', value: 5231 },
//       { type: 'Foundation', country: 'China', value: 10119 },
//       { type: 'Foundation', country: 'USA', value: 10342 },
//       { type: 'Lip gloss', country: 'Africa', value: 4008 },
//       { type: 'Lip gloss', country: 'EU', value: 4572 },
//       { type: 'Lip gloss', country: 'China', value: 12043 },
//       { type: 'Lip gloss', country: 'USA', value: 22998 },
//       { type: 'Mascara', country: 'Africa', value: 18712 },
//       { type: 'Mascara', country: 'EU', value: 6134 },
//       { type: 'Mascara', country: 'China', value: 10419 },
//       { type: 'Mascara', country: 'USA', value: 11261 }
//     ]
//   },
//   title: {
//     visible: true,
//     text: 'Stacked line chart'
//   },
//   stack: true,
//   xField: 'type',
//   yField: 'value',
//   seriesField: 'country',
//   lineLabel: { visible: true },
//   legends: [{ visible: true, position: 'middle', orient: 'bottom' }]
// };

// describe('Description', () => {
//   const containerDom: HTMLElement = createDiv();
//   containerDom.style.position = 'relative';
//   containerDom.style.width = '1000px';
//   containerDom.style.height = '800px';

//   const vchart = new VChart(spec, { dom: containerDom });
//   vchart.renderSync();
//   addVChartDescription(vchart, 'vchart');

//   test('canvas tag', () => {
//     expect(vchart.getCanvas().getAttribute('midscene-description-ref')).toBe('vchart');
//   });

//   test('script', () => {
//     const scripts = document.querySelectorAll('#script');
//     const script = scripts[scripts.length - 1];

//     expect(script.getAttribute('midscene-description-id')).toBe('vchart');
//     expect(script.innerHTML).toBe('');

//   })
// });
