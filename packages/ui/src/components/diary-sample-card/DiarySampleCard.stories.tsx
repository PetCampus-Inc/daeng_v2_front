import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiarySampleCard } from './DiarySampleCard';

const meta = {
  title: 'Components/DiarySampleCard',
  component: DiarySampleCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DiarySampleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    image: <span className='bg-primitive-orange-300 block size-full' />,
  },
};
