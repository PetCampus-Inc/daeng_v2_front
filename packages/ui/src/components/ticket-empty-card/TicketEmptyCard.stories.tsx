import type { Meta, StoryObj } from '@storybook/nextjs';
import { TicketEmptyCard } from './TicketEmptyCard';

const meta = {
  title: 'Components/TicketEmptyCard',
  component: TicketEmptyCard,
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
} satisfies Meta<typeof TicketEmptyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
