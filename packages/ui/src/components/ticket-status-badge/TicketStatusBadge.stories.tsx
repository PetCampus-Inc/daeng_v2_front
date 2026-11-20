import type { Meta, StoryObj } from '@storybook/nextjs';
import { TicketStatusBadge } from './TicketStatusBadge';

const meta = {
  title: 'Components/TicketStatusBadge',
  component: TicketStatusBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['remaining', 'dday', 'expired'],
    },
  },
} satisfies Meta<typeof TicketStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'remaining',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex items-center gap-2'>
      <TicketStatusBadge status='remaining' />
      <TicketStatusBadge status='dday' />
      <TicketStatusBadge status='expired' />
    </div>
  ),
};
