import type { Meta, StoryObj } from '@storybook/nextjs';
import { TimeRangeField } from './TimeRangeField';

const meta = {
  title: 'Components/TimeRangeField',
  component: TimeRangeField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'filled', 'error'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimeRangeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    startTime: '09:00',
    endTime: '12:00',
    state: 'default',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col gap-8'>
      <TimeRangeField startTime='09:00' endTime='12:00' state='default' />
      <TimeRangeField startTime='09:00' endTime='12:00' state='filled' />
      <TimeRangeField
        startTime='12:00'
        endTime='09:00'
        state='error'
        errorMessage='시작 시간은 종료 시간보다 빨라야 해요.'
      />
    </div>
  ),
};
