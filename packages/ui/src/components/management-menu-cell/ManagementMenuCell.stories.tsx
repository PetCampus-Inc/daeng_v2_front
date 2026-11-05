import type { Meta, StoryObj } from '@storybook/nextjs';
import { ManagementMenuCell } from './ManagementMenuCell';

const meta = {
  title: 'Components/ManagementMenuCell',
  component: ManagementMenuCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    menu: {
      control: 'select',
      options: ['ticket', 'reservation'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ManagementMenuCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    menu: 'ticket',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col gap-2'>
      <ManagementMenuCell menu='ticket' />
      <ManagementMenuCell menu='reservation' />
    </div>
  ),
};
