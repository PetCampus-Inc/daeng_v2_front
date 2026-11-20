import type { Meta, StoryObj } from '@storybook/nextjs';
import { Qr } from '@knockdog/icons';

const meta = {
  title: 'Components/Qr',
  component: Qr,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Qr>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
