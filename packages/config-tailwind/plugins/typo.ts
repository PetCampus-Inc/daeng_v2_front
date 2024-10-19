import * as plugin from 'tailwindcss/plugin';

export const typography = plugin.withOptions(() => {
  return function ({ addUtilities }) {
    addUtilities({
      // Size
      '.typo-size-10': {
        fontSize: '10px',
        lineHeight: '13px',
      },
      '.typo-size-12': {
        fontSize: '12px',
        lineHeight: '15px',
      },
      '.typo-size-14': {
        fontSize: '14px',
        lineHeight: '17px',
      },
      '.typo-size-16': {
        fontSize: '16px',
        lineHeight: '20px',
      },
      '.typo-size-18': {
        fontSize: '18px',
        lineHeight: '24px',
      },
      '.typo-size-20': {
        fontSize: '20px',
        lineHeight: '27px',
      },
      '.typo-size-24': {
        fontSize: '24px',
        lineHeight: '30px',
      },
      '.typo-size-28': {
        fontSize: '28px',
        lineHeight: '36px',
      },

      // Title
      '.typo-title-20': {
        fontSize: '20px',
        lineHeight: '26px',
        letterSpacing: '-1.2px',
        fontWeight: '400',
      },
      '.typo-title-20-b': {
        fontSize: '20px',
        lineHeight: '28px',
        letterSpacing: '-0.24px',
        fontWeight: '700',
      },
      '.typo-title-24': {
        fontSize: '24px',
        lineHeight: '26px',
        letterSpacing: '-1.2px',
        fontWeight: '400',
      },
      '.typo-title-24-b': {
        fontSize: '24px',
        lineHeight: '32px',
        letterSpacing: '-1.2px',
        fontWeight: '700',
      },
      '.typo-title-28-b': {
        fontSize: '28px',
        lineHeight: '40px',
        letterSpacing: '0px',
        fontWeight: '700',
      },

      // Body
      '.typo-body-16': {
        fontSize: '16px',
        lineHeight: '23px',
        letterSpacing: '-0.192px',
        fontWeight: '400',
      },
      '.typo-body-16-b': {
        fontSize: '16px',
        lineHeight: '23px',
        letterSpacing: '-1.2px',
        fontWeight: '700',
      },
      '.typo-body-18': {
        fontSize: '18px',
        lineHeight: '26px',
        letterSpacing: '-1.2px',
        fontWeight: '400',
      },
      '.typo-body-18-b': {
        fontSize: '18px',
        lineHeight: '27px',
        letterSpacing: '0px',
        fontWeight: '700',
      },

      // Label
      '.typo-label-14': {
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: '0.28px',
        fontWeight: '400',
      },
      '.typo-label-14-m': {
        fontSize: '14px',
        lineHeight: '25px',
        letterSpacing: '0.28px',
        fontWeight: '500',
      },
      '.typo-label-14-b': {
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: '0.28px',
        fontWeight: '700',
      },
      '.typo-label-16': {
        fontSize: '16px',
        lineHeight: '24px',
        letterSpacing: '-0.192px',
        fontWeight: '400',
      },
      '.typo-label-16-m': {
        fontSize: '16px',
        lineHeight: '24px',
        letterSpacing: '-1.2px',
        fontWeight: '500',
      },
      '.typo-label-16-b': {
        fontSize: '16px',
        lineHeight: '24px',
        letterSpacing: '-0.192px',
        fontWeight: '700',
      },

      // Caption
      '.typo-caption-10': {
        fontSize: '10px',
        lineHeight: '17.5px',
        letterSpacing: '-0.12px',
        fontWeight: '400',
      },
      '.typo-caption-12': {
        fontSize: '12px',
        lineHeight: '17.5px',
        letterSpacing: '-0.12px',
        fontWeight: '400',
      },
      '.typo-caption-12-b': {
        fontSize: '12px',
        lineHeight: '20px',
        letterSpacing: '0.24px',
        fontWeight: '700',
      },
    });
  };
});
