import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryTopBar } from './DiaryTopBar';

const meta = {
  title: 'Components/DiaryTopBar',
  component: DiaryTopBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['menu', 'plain', 'edit', 'editing'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[390px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiaryTopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    mode: 'menu',
  },
};

export const All: Story = {
  render: () => (
    <div className='bg-fill-secondary-100 flex w-[390px] flex-col gap-x3 py-x4'>
      <DiaryTopBar mode='menu' />
      <DiaryTopBar mode='plain' />
      <DiaryTopBar mode='edit' />
      <DiaryTopBar mode='editing' />
    </div>
  ),
};
