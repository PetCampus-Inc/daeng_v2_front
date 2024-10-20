import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import { colors } from '@knockdog/design-system/theme';
import { typography, zIndex, shadow } from './plugins';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/components/**/*.{ts,tsx}',
  ],
  theme: {
    colors,
    fontFamily: {
      pretendard: ['var(--pretendard)', ...fontFamily.sans],
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px',
    },
  },
  plugins: [tailwindcssAnimate, typography, zIndex, shadow],
} satisfies Config;

export default config;
