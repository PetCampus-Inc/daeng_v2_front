import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvHistory } from '@knockdog/icons';

const meta = {
  title: 'Components/RsvHistory',
  component: RsvHistory,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RsvHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
