import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
// import { typographyPlugin } from '@repo/design-system/tailwind-plugins';

const config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/components/**/*.{ts,tsx}',
  ],
  theme: {},
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
