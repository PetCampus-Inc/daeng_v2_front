import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiarySegmentedControl } from './DiarySegmentedControl';

const meta = {
  title: 'Components/DiarySegmentedControl',
  component: DiarySegmentedControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    defaultValue: {
      control: 'select',
      options: ['kindergarten', 'diary'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiarySegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 'kindergarten',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col gap-x3'>
      <DiarySegmentedControl defaultValue='kindergarten' />
      <DiarySegmentedControl defaultValue='diary' />
      <DiarySegmentedControl defaultValue='diary' hasBadge />
    </div>
  ),
};
