import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryCalendarBanner } from './DiaryCalendarBanner';

const meta = {
  title: 'Components/DiaryCalendarBanner',
  component: DiaryCalendarBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['today', 'past', 'disabled'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[299px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiaryCalendarBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    state: 'today',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[299px] flex-col gap-x3'>
      <DiaryCalendarBanner state='today' />
      <DiaryCalendarBanner state='past' />
      <DiaryCalendarBanner state='disabled' />
    </div>
  ),
};
