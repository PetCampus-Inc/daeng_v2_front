import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvPinFill } from '@knockdog/icons';

const meta = {
  title: 'Components/RsvPinFill',
  component: RsvPinFill,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RsvPinFill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
