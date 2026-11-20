import type { Meta, StoryObj } from '@storybook/nextjs';

import { AiWrittenBadge } from './AiWrittenBadge';

const meta = {
  title: 'Components/AiWrittenBadge',
  component: AiWrittenBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AiWrittenBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
