import type { Meta, StoryObj } from '@storybook/nextjs';
import { StatusFilterChip } from './StatusFilterChip';

const meta = {
  title: 'Components/StatusFilterChip',
  component: StatusFilterChip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof StatusFilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Selected: Story = {
  args: { selected: true, children: '전체 22' },
};

export const Unselected: Story = {
  args: { children: '만료 예정 2' },
};
