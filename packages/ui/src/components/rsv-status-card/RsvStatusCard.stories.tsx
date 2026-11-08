import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvStatusCard } from './RsvStatusCard';

const meta = {
  title: 'Components/RsvStatusCard',
  component: RsvStatusCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['confirmed', 'attended', 'absence'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RsvStatusCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'confirmed',
  },
};

export const All: Story = {
  render: () => (
    <div className='bg-fill-secondary-100 flex w-[358px] flex-col gap-x3 p-x4'>
      <RsvStatusCard status='confirmed' />
      <RsvStatusCard status='attended' />
      <RsvStatusCard status='absence' />
    </div>
  ),
};
