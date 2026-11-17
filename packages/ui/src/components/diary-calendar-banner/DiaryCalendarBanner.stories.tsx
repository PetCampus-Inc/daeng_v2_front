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
    <div className='flex flex-col items-start gap-x3'>
      <DiaryCalendarBanner state='today' dogName='콩이' />
      <DiaryCalendarBanner state='past' dogName='강아지 이름' />
      <DiaryCalendarBanner state='disabled' />
    </div>
  ),
};
