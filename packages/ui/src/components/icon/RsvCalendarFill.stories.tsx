import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvCalendarFill } from '@knockdog/icons';

const meta = {
  title: 'Components/RsvCalendarFill',
  component: RsvCalendarFill,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RsvCalendarFill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
