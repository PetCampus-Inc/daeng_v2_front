import sharedConfig from '@knockdog/tailwind-config';
import type { Config } from 'tailwindcss';

const config: Pick<
  Config,
  'prefix' | 'presets' | 'theme' | 'plugins' | 'darkMode'
> = {
  darkMode: 'class',
  presets: [sharedConfig],
};

export default config;
