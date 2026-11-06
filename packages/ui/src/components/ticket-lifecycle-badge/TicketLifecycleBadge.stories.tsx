import type { Meta, StoryObj } from '@storybook/nextjs';
import { TicketLifecycleBadge } from './TicketLifecycleBadge';

const meta = {
  title: 'Components/TicketLifecycleBadge',
  component: TicketLifecycleBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'scheduled', 'onHold', 'expired'],
    },
  },
} satisfies Meta<typeof TicketLifecycleBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'active',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex items-center gap-2'>
      <TicketLifecycleBadge status='active' />
      <TicketLifecycleBadge status='scheduled' />
      <TicketLifecycleBadge status='expired' />
      <TicketLifecycleBadge status='onHold' />
    </div>
  ),
};
