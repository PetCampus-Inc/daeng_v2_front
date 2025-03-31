'use client';

import { cva } from 'class-variance-authority';

const tabsListVariants = cva('inline-flex items-center w-full', {
  variants: {
    variant: {
      underline: '',
      divider: '',
    },
    margin: {
      0: 'mx-0',
      2: 'mx-2',
      4: 'mx-4',
    },
    gap: {
      0: 'gap-0',
      2: 'gap-2',
      4: 'gap-4',
    },
    align: {
      start: 'justify-start',
      center: 'justify-center',
      between: 'justify-between',
    },
  },
  defaultVariants: {
    variant: 'underline',
    margin: 0,
    align: 'center',
    gap: 4,
  },
  compoundVariants: [
    {
      variant: 'divider',
      class: 'justify-between gap-0',
    },
  ],
});

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 typo-body-18-b',
  {
    variants: {
      variant: {
        underline: 'py-1.5 data-[state=active]:text-white text-brown2',
        divider:
          'flex-1 text-center data-[state=active]:text-primary text-gray4 border-l border-gray5 first:border-l-0',
      },
      padding: {
        0: 'px-0',
        2: 'px-2',
        4: 'px4',
        8: 'px-8',
      },
    },
    defaultVariants: {
      padding: 0,
    },
  }
);

const tabsIndicatorVariants = cva(
  'absolute bottom-0 transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        underline: 'h-[2px] bg-white',
        divider: 'hidden',
      },
    },
    defaultVariants: {
      variant: 'underline',
    },
  }
);

export { tabsListVariants, tabsTriggerVariants, tabsIndicatorVariants };
