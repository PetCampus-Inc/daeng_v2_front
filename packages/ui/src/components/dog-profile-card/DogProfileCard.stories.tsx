import type { Meta, StoryObj } from '@storybook/nextjs';
import { DogProfileCard } from './DogProfileCard';

const meta = {
  title: 'Components/DogProfileCard',
  component: DogProfileCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    gender: {
      control: 'select',
      options: ['female', 'male'],
    },
  },
} satisfies Meta<typeof DogProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isRepresentative: true,
    gender: 'female',
  },
};
