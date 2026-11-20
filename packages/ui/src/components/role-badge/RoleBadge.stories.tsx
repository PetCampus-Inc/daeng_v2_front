import type { Meta, StoryObj } from '@storybook/nextjs';
import { RoleBadge } from './RoleBadge';

const meta = {
  title: 'Components/RoleBadge',
  component: RoleBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    role: {
      control: 'select',
      options: ['director', 'staff', 'admin'],
    },
  },
} satisfies Meta<typeof RoleBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    role: 'director',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex items-center gap-2'>
      <RoleBadge role='director' />
      <RoleBadge role='staff' />
      <RoleBadge role='admin' />
    </div>
  ),
};
