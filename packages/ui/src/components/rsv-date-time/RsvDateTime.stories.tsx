import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvDateTime } from './RsvDateTime';

const meta = {
  title: 'Components/RsvDateTime',
  component: RsvDateTime,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['date', 'time'],
    },
  },
} satisfies Meta<typeof RsvDateTime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'date',
    isFilled: true,
  },
};

export const All: Story = {
  render: () => (
    <div className='flex flex-col items-start gap-3'>
      <RsvDateTime type='date' />
      <RsvDateTime type='date' isFilled={false} />
      <RsvDateTime type='time' />
      <RsvDateTime type='time' isFilled={false} />
    </div>
  ),
};
