import type { Preview } from '@storybook/nextjs';

import '../src/globals.css';

/** @type { import('@storybook/nextjs').Preview } */
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
