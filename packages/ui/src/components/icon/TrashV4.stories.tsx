import type { Meta, StoryObj } from '@storybook/nextjs';
import { TrashV4 } from '@knockdog/icons';

const meta = {
  title: 'Components/TrashV4',
  component: TrashV4,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TrashV4>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
