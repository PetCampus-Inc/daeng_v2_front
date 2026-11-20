import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvDayStatus } from './RsvDayStatus';

const meta = {
  title: 'Components/RsvDayStatus',
  component: RsvDayStatus,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['empty', 'unselectable', 'selectable', 'today', 'selected', 'reserved', 'todaySelected', 'reservedSelected'],
    },
  },
} satisfies Meta<typeof RsvDayStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'today',
  },
};

export const All: Story = {
  render: () => (
    <div className='bg-fill-secondary-100 flex items-start gap-x3 p-x4'>
      <RsvDayStatus status='today' />
      <RsvDayStatus status='selectable' />
      <RsvDayStatus status='selected' />
      <RsvDayStatus status='reserved' />
      <RsvDayStatus status='unselectable' />
      <RsvDayStatus status='empty' />
      <RsvDayStatus status='todaySelected' />
      <RsvDayStatus status='reservedSelected' />
    </div>
  ),
};
