import type { Meta, StoryObj } from '@storybook/nextjs';
import { ListHeader } from './ListHeader';

const meta = {
  title: 'Components/ListHeader',
  component: ListHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[390px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sort: Story = {};

export const Filter: Story = {
  args: { variant: 'filter' },
};
