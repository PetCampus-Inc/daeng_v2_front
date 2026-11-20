import type { Meta, StoryObj } from '@storybook/nextjs';
import { CalendarV4 } from '@knockdog/icons';

/** V4 / Icon / Calendar */
const meta = {
  title: 'Components/CalendarV4',
  component: CalendarV4,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CalendarV4>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
