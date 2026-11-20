import type { Meta, StoryObj } from '@storybook/nextjs';
import { StudentTicketListItem } from './StudentTicketListItem';

const meta = {
  title: 'Components/StudentTicketListItem',
  component: StudentTicketListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[390px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StudentTicketListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: '가나디',
    guardian: '김지원 보호자 · 010-0000-0000',
    sex: 'female',
    status: '1회 남음',
  },
};

export const WithTicket: Story = {
  args: {
    name: '가나디',
    guardian: '김지원 보호자 · 010-0000-0000',
    sex: 'female',
    status: '1회 남음',
    ticketName: '20회권..',
    ticketDetail: '1회 · 90일 남음',
  },
};
