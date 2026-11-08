import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvCopyLine } from '@knockdog/icons';

const meta = {
  title: 'Components/RsvCopyLine',
  component: RsvCopyLine,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RsvCopyLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
