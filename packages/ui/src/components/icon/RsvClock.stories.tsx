import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvClock } from '@knockdog/icons';

const meta = {
  title: 'Components/RsvClock',
  component: RsvClock,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RsvClock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
