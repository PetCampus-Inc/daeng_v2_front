import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    totalSteps: {
      control: { type: 'number', min: 1, max: 10 },
      description: '전체 단계 수',
    },
    value: {
      control: { type: 'number', min: 0 },
      description: '현재 진행 단계',
    },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalSteps: 5,
    value: 2,
  },
  decorators: [
    (Story) => (
      <div className='w-80'>
        <Story />
      </div>
    ),
  ],
};

export const Empty: Story = {
  args: {
    totalSteps: 5,
    value: 0,
  },
  decorators: [
    (Story) => (
      <div className='w-80'>
        <Story />
      </div>
    ),
  ],
};

export const Complete: Story = {
  args: {
    totalSteps: 5,
    value: 5,
  },
  decorators: [
    (Story) => (
      <div className='w-80'>
        <Story />
      </div>
    ),
  ],
};

export const SingleStep: Story = {
  args: {
    totalSteps: 1,
    value: 1,
  },
  decorators: [
    (Story) => (
      <div className='w-80'>
        <Story />
      </div>
    ),
  ],
};

export const ManySteps: Story = {
  args: {
    totalSteps: 10,
    value: 7,
  },
  decorators: [
    (Story) => (
      <div className='w-80'>
        <Story />
      </div>
    ),
  ],
};

export const HalfProgress: Story = {
  args: {
    totalSteps: 6,
    value: 3,
  },
  decorators: [
    (Story) => (
      <div className='w-80'>
        <Story />
      </div>
    ),
  ],
};
