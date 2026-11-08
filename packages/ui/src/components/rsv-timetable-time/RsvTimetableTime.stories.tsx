import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvTimetableTime } from './RsvTimetableTime';

const meta = {
  title: 'Components/RsvTimetableTime',
  component: RsvTimetableTime,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'disabled', 'selected'],
    },
  },
} satisfies Meta<typeof RsvTimetableTime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    state: 'default',
    isReserved: false,
  },
  decorators: [
    (Story) => (
      <div className='w-[77px]'>
        <Story />
      </div>
    ),
  ],
};

export const All: Story = {
  render: () => (
    <div className='flex items-center gap-x1_5'>
      <div className='w-[77px]'>
        <RsvTimetableTime />
      </div>
      <div className='w-[77px]'>
        <RsvTimetableTime state='disabled' />
      </div>
      <div className='w-[77px]'>
        <RsvTimetableTime state='selected' />
      </div>
      <div className='w-[77px]'>
        <RsvTimetableTime isReserved />
      </div>
    </div>
  ),
};
