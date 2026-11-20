import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryNoteBanner } from './DiaryNoteBanner';

const meta = {
  title: 'Components/DiaryNoteBanner',
  component: DiaryNoteBanner,
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
} satisfies Meta<typeof DiaryNoteBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    dogName: '콩이',
  },
};
