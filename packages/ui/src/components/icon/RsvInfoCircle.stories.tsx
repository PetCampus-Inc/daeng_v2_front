import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvInfoCircle } from '@knockdog/icons';

const meta = {
  title: 'Components/RsvInfoCircle',
  component: RsvInfoCircle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RsvInfoCircle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'text-text-accent',
  },
};

export const Error: Story = {
  args: {
    className: 'text-error',
  },
};

export const Gray: Story = {
  args: {
    className: 'text-text-caption',
  },
};
