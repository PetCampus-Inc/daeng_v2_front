import type { Meta, StoryObj } from '@storybook/nextjs';
import { ExpirationDateRow } from './ExpirationDateRow';

const meta = {
  title: 'Components/ExpirationDateRow',
  component: ExpirationDateRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[342px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExpirationDateRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '만료일',
    date: '2026.12.04',
  },
};
