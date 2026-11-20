import type { Meta, StoryObj } from '@storybook/nextjs';
import { EditV4 } from '@knockdog/icons';

const meta = {
  title: 'Components/EditV4',
  component: EditV4,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof EditV4>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
