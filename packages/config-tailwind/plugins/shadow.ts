import { withOptions } from 'tailwindcss/plugin';

export const shadow = withOptions(() => {
  return function ({ addUtilities }) {
    addUtilities({
      '.shadow-upper': { boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.04)' },
      '.shadow-card': { boxShadow: '0px 8px 15px 0px rgba(0, 0, 0, 0.04)' },
      '.shadow-smallMenu': {
        boxShadow: '2px 8px 30px 0px rgba(82, 82, 82, 0.35)',
      },
      '.shadow-alertCard': {
        boxShadow: '0px 8px 15px 8px rgba(156, 155, 155, 0.07)',
      },
      '.shadow-overlap': { boxShadow: '-4px 0px 12px rgba(0,0,0,0.35)' },
      '.shadow-input': { boxShadow: '0px -5px 10px rgba(0,0,0,0.04)' },
      '.shadow-bottomTab': {
        boxShadow: '0px -17px 39px -15px rgba(167,167,167,0.15)',
      },
      '.shadow-dogCard': { boxShadow: '0px 2px 7px 0px rgba(0, 0, 0, 0.04)' },
    });
  };
});
