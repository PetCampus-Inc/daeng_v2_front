import type { Meta, StoryObj } from '@storybook/nextjs';
import { MonthlyCalendar } from './MonthlyCalendar';

const meta = {
  title: 'Components/MonthlyCalendar',
  component: MonthlyCalendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MonthlyCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultMonth: new Date(2026, 10, 1),
    defaultValue: new Date(2026, 10, 1),
  },
};
