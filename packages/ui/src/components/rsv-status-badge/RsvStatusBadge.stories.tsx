import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvStatusBadge } from './RsvStatusBadge';

const meta = {
  title: 'Components/RsvStatusBadge',
  component: RsvStatusBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['confirmed', 'attended', 'absence'],
    },
  },
} satisfies Meta<typeof RsvStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'confirmed',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex items-center gap-2'>
      <RsvStatusBadge status='confirmed' />
      <RsvStatusBadge status='attended' />
      <RsvStatusBadge status='absence' />
    </div>
  ),
};
