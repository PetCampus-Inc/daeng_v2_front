// import plugin from 'tailwindcss/plugin';
// import { typography } from '../theme/typo';

// export const typographyPlugin = plugin(function ({ addUtilities }) {
//   const newUtilities = Object.entries(typography).reduce(
//     (acc, [key, value]) => {
//       acc[`.${key}`] = value.split(' ').reduce(
//         (styles, className) => {
//           const [property, propertyValue] = className
//             .replace('text-', '')
//             .replace('[', '')
//             .replace(']', '')
//             .split('-');
//           if (property === 'leading') {
//             styles['lineHeight'] = propertyValue;
//           } else if (property === 'tracking') {
//             styles['letterSpacing'] = propertyValue;
//           } else if (property === 'font') {
//             styles['fontWeight'] =
//               propertyValue === 'normal'
//                 ? '400'
//                 : propertyValue === 'medium'
//                   ? '500'
//                   : propertyValue === 'bold'
//                     ? '700'
//                     : propertyValue;
//           } else {
//             styles[property] = propertyValue;
//           }
//           return styles;
//         },
//         {} as Record<string, string>,
//       );
//       return acc;
//     },
//     {} as Record<string, Record<string, string>>,
//   );

//   addUtilities(newUtilities);
// });
