import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryImportBanner } from './DiaryImportBanner';

const meta = {
  title: 'Components/DiaryImportBanner',
  component: DiaryImportBanner,
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
} satisfies Meta<typeof DiaryImportBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    dogName: '콩이',
  },
};
