import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvPhone } from '@knockdog/icons';

const meta = {
  title: 'Components/RsvPhone',
  component: RsvPhone,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RsvPhone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
