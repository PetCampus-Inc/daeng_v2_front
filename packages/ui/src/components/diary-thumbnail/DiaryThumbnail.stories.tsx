import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryThumbnail } from './DiaryThumbnail';

const meta = {
  title: 'Components/DiaryThumbnail',
  component: DiaryThumbnail,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[299px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiaryThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

const photo = <span className='bg-primitive-orange-300 block size-full' />;

export const Default: Story = {
  args: {
    photoCount: 1,
    image: photo,
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[299px] flex-col gap-x6'>
      <DiaryThumbnail photoCount={1} image={photo} />
      <DiaryThumbnail photoCount={3} image={photo} />
    </div>
  ),
};
