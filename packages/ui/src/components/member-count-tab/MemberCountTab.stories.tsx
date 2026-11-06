import type { Meta, StoryObj } from '@storybook/nextjs';
import { MemberCountTab } from './MemberCountTab';

const meta = {
  title: 'Components/MemberCountTab',
  component: MemberCountTab,
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
} satisfies Meta<typeof MemberCountTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const First: Story = {};

export const Second: Story = {
  args: { defaultValue: 'second' },
};
