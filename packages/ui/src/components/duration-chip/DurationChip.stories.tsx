import type { Meta, StoryObj } from '@storybook/nextjs';
import { DurationChip } from './DurationChip';

const meta = {
  title: 'Components/DurationChip',
  component: DurationChip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DurationChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};
