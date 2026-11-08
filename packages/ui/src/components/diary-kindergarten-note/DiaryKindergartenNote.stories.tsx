import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryKindergartenNote } from './DiaryKindergartenNote';

const meta = {
  title: 'Components/DiaryKindergartenNote',
  component: DiaryKindergartenNote,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[364px] pt-[9px]'>
        <div className='w-[358px]'>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof DiaryKindergartenNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultOpen: false,
  },
};

export const All: Story = {
  render: () => (
    <div className='flex flex-col gap-x4'>
      <DiaryKindergartenNote isOpen={false} />
      <DiaryKindergartenNote isOpen />
    </div>
  ),
};
