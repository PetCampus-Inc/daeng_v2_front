import type { Meta, StoryObj } from '@storybook/nextjs';
import { CustomDurationChip } from './CustomDurationChip';

const meta = {
  title: 'Components/CustomDurationChip',
  component: CustomDurationChip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CustomDurationChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};
