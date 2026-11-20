import type { Meta, StoryObj } from '@storybook/nextjs';
import { ApprovalActionButton } from './ApprovalActionButton';

const meta = {
  title: 'Components/ApprovalActionButton',
  component: ApprovalActionButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    action: {
      control: 'select',
      options: ['reject', 'approve'],
    },
    state: {
      control: 'select',
      options: ['default', 'pressed'],
    },
  },
} satisfies Meta<typeof ApprovalActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    action: 'reject',
    state: 'default',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-2'>
        <ApprovalActionButton action='reject' />
        <ApprovalActionButton action='approve' />
      </div>
      <div className='flex gap-2'>
        <ApprovalActionButton action='reject' state='pressed' />
        <ApprovalActionButton action='approve' state='pressed' />
      </div>
    </div>
  ),
};
