import type { Meta, StoryObj } from '@storybook/nextjs';
import { TicketListItem } from './TicketListItem';

const meta = {
  title: 'Components/TicketListItem',
  component: TicketListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TicketListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '이용권 이름',
    description: '충전 횟수 • 유효기간',
  },
};
