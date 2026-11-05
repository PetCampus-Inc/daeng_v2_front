import type { Meta, StoryObj } from '@storybook/nextjs';
import { ChargeButton } from './ChargeButton';

const meta = {
  title: 'Components/ChargeButton',
  component: ChargeButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ChargeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
