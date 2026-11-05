import type { Meta, StoryObj } from '@storybook/nextjs';
import { TicketSummaryCard } from './TicketSummaryCard';

const meta = {
  title: 'Components/TicketSummaryCard',
  component: TicketSummaryCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'scheduled', 'expired'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TicketSummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '체험권',
    status: 'active',
    remainingCount: 3,
    totalCount: 10,
    period: '2026.08.01 ~ 2026.11.30',
    remainingDays: 20,
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col gap-3'>
      <TicketSummaryCard
        title='체험권'
        status='active'
        remainingCount={3}
        totalCount={10}
        period='2026.08.01 ~ 2026.11.30'
        remainingDays={20}
      />
      <TicketSummaryCard
        title='자유 10회권'
        status='scheduled'
        remainingCount={10}
        totalCount={10}
        period='2026.08.01 ~ 만료 없음'
      />
    </div>
  ),
};
