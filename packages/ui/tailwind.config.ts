import type { Config } from 'tailwindcss';
import sharedConfig from '@knockdog/tailwind-config';

const config: Pick<
  Config,
  'prefix' | 'presets' | 'theme' | 'plugins' | 'darkMode'
> = {
  darkMode: 'class',
  presets: [sharedConfig],
};

export default config;
