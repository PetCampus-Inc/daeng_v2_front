import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import { colors } from '@repo/design-system/theme';
import { typography, zIndex, shadow } from './plugins';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/components/**/*.{ts,tsx}',
  ],
  theme: { colors },
  plugins: [tailwindcssAnimate, typography, zIndex, shadow],
} satisfies Config;

export default config;
