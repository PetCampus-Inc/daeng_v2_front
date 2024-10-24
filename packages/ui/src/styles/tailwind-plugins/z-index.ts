import * as plugin from 'tailwindcss/plugin';

export const zIndex = plugin.withOptions(() => {
  return function ({ addUtilities }) {
    addUtilities({
      '.z-hide': { zIndex: '-1' },
      '.z-base': { zIndex: '0' },
      '.z-docked': { zIndex: '10' },
      '.z-dropdown': { zIndex: '1000' },
      '.z-sticky': { zIndex: '1100' },
      '.z-banner': { zIndex: '1200' },
      '.z-overlay': { zIndex: '1300' },
      '.z-modal': { zIndex: '1400' },
      '.z-popover': { zIndex: '1500' },
      '.z-skipLink': { zIndex: '1600' },
      '.z-toast': { zIndex: '1700' },
      '.z-tooltip': { zIndex: '1800' },
    });
  };
});
