import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvMonthlyCalendar } from './RsvMonthlyCalendar';

const meta = {
  title: 'Components/RsvMonthlyCalendar',
  component: RsvMonthlyCalendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[390px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RsvMonthlyCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

const octoberDays = (days: number[]) => days.map((day) => new Date(2026, 9, day));

export const Default: Story = {
  args: {
    defaultMonth: new Date(2026, 9, 1),
    today: new Date(2026, 9, 5),
    defaultValue: new Date(2026, 9, 13),
    reservedDates: octoberDays([7, 9]),
    disabledDates: octoberDays([1, 2, 3, 4, 8, 11, 15, 18, 22, 25, 29]),
  },
};
