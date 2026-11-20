import type { Meta, StoryObj } from '@storybook/nextjs';
import { UpcomingRsvCard } from './UpcomingRsvCard';

const meta = {
  title: 'Components/UpcomingRsvCard',
  component: UpcomingRsvCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'empty'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UpcomingRsvCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'active',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col gap-x3'>
      <UpcomingRsvCard />
      <UpcomingRsvCard status='empty' />
    </div>
  ),
};
