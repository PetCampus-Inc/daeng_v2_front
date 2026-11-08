import type { Meta, StoryObj } from '@storybook/nextjs';
import { SelectDogPanel } from './SelectDogPanel';

const meta = {
  title: 'Components/SelectDogPanel',
  component: SelectDogPanel,
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
} satisfies Meta<typeof SelectDogPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
