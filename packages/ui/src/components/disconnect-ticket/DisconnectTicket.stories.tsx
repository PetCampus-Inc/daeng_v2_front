import type { Meta, StoryObj } from '@storybook/nextjs';
import { DisconnectTicket } from './DisconnectTicket';

const meta = {
  title: 'Components/DisconnectTicket',
  component: DisconnectTicket,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    kind: {
      control: 'select',
      options: ['pass', 'reservation'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[342px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DisconnectTicket>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    kind: 'pass',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[342px] flex-col gap-x2_5'>
      <DisconnectTicket kind='pass' />
      <DisconnectTicket kind='reservation' />
    </div>
  ),
};
