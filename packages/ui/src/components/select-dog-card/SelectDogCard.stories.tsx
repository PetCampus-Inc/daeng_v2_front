import type { Meta, StoryObj } from '@storybook/nextjs';
import { SelectDogCard } from './SelectDogCard';

const meta = {
  title: 'Components/SelectDogCard',
  component: SelectDogCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['closed', 'open', 'list'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[390px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SelectDogCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'closed',
  },
};

export const All: Story = {
  render: () => (
    <div className='bg-fill-secondary-100 flex w-[390px] flex-col gap-x4 py-x4'>
      <SelectDogCard />
      <SelectDogCard variant='open' />
      <SelectDogCard variant='list' />
    </div>
  ),
};
