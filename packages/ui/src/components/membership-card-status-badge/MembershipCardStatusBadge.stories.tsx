import type { Meta, StoryObj } from '@storybook/nextjs';
import { MembershipCardStatusBadge } from './MembershipCardStatusBadge';

const meta = {
  title: 'Components/MembershipCardStatusBadge',
  component: MembershipCardStatusBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['soon', 'active', 'scheduled', 'onHold', 'expired'],
    },
  },
} satisfies Meta<typeof MembershipCardStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'soon',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex flex-col items-start gap-2'>
      <div className='flex items-center gap-2'>
        <MembershipCardStatusBadge status='soon' />
        <MembershipCardStatusBadge status='active' />
      </div>
      <div className='flex items-center gap-2'>
        <MembershipCardStatusBadge status='scheduled' />
        <MembershipCardStatusBadge status='onHold' />
      </div>
      <MembershipCardStatusBadge status='expired' />
    </div>
  ),
};
