import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryCalendarDay, type DiaryCalendarDayState } from './DiaryCalendarDay';

const meta = {
  title: 'Components/DiaryCalendarDay',
  component: DiaryCalendarDay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['pastEmpty', 'todayEmpty', 'futureEmpty', 'emptySelected', 'empty', 'filled', 'filledSelected', 'todayFilled'],
    },
  },
} satisfies Meta<typeof DiaryCalendarDay>;

export default meta;
type Story = StoryObj<typeof meta>;

const dayImage = <span className='bg-primitive-orange-300 block size-full' />;

export const Default: Story = {
  args: {
    state: 'pastEmpty',
    children: 15,
  },
};

const DAY_STATES: DiaryCalendarDayState[] = [
  'pastEmpty',
  'todayEmpty',
  'futureEmpty',
  'emptySelected',
  'empty',
  'filled',
  'filledSelected',
  'todayFilled',
];

export const All: Story = {
  render: () => (
    <div className='flex w-[220px] flex-wrap gap-x3'>
      {DAY_STATES.map((state) => (
        <DiaryCalendarDay key={state} state={state} image={dayImage}>
          {state === 'empty' ? null : 15}
        </DiaryCalendarDay>
      ))}
    </div>
  ),
};
