import type { Meta, StoryObj } from '@storybook/nextjs';
import { TodayButton } from './TodayButton';

const meta = {
  title: 'Components/TodayButton',
  component: TodayButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TodayButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
