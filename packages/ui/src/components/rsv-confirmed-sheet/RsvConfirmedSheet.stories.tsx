import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvConfirmedSheet } from './RsvConfirmedSheet';

const meta = {
  title: 'Components/RsvConfirmedSheet',
  component: RsvConfirmedSheet,
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
} satisfies Meta<typeof RsvConfirmedSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
