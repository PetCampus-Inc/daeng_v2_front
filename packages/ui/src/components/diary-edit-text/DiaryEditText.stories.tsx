import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryEditText } from './DiaryEditText';

const meta = {
  title: 'Components/DiaryEditText',
  component: DiaryEditText,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiaryEditText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isEditing: false,
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col gap-x4'>
      <DiaryEditText isEditing />
      <DiaryEditText />
    </div>
  ),
};
