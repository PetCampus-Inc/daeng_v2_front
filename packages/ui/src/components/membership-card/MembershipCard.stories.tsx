import type { Meta, StoryObj } from '@storybook/nextjs';
import { MembershipCard } from './MembershipCard';

const meta = {
  title: 'Components/MembershipCard',
  component: MembershipCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['active', 'onHold', 'scheduled', 'expired', 'reservation', 'empty'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MembershipCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    state: 'active',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col gap-x3'>
      <MembershipCard state='active' />
      <MembershipCard state='onHold' />
      <MembershipCard state='scheduled' />
      <MembershipCard state='expired' />
      <MembershipCard state='reservation' />
      <MembershipCard state='empty' />
    </div>
  ),
};
