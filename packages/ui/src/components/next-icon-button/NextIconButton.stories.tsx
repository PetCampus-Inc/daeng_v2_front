import type { Meta, StoryObj } from '@storybook/nextjs';
import { NextIconButton } from './NextIconButton';

const meta = {
  title: 'Components/NextIconButton',
  component: NextIconButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof NextIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    filled: true,
    'aria-label': '다음',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex flex-col items-center gap-2'>
      <NextIconButton filled aria-label='다음' />
      <NextIconButton filled={false} aria-label='다음' />
    </div>
  ),
};
