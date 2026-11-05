import type { Meta, StoryObj } from '@storybook/nextjs';
import { DisconnectButton } from './DisconnectButton';

const meta = {
  title: 'Components/DisconnectButton',
  component: DisconnectButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DisconnectButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
