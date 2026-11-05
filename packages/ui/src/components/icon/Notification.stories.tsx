import type { Meta, StoryObj } from '@storybook/nextjs';
import { Notification } from '@knockdog/icons';

const meta = {
  title: 'Components/Notification',
  component: Notification,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    unread: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Notification>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    unread: false,
  },
};

export const Unread: Story = {
  args: {
    unread: true,
  },
};
