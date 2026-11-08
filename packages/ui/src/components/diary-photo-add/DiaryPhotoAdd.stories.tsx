import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryPhotoAdd } from './DiaryPhotoAdd';

const meta = {
  title: 'Components/DiaryPhotoAdd',
  component: DiaryPhotoAdd,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DiaryPhotoAdd>;

export default meta;
type Story = StoryObj<typeof meta>;

const photo = <span className='bg-primitive-orange-200 block size-full' />;

export const Default: Story = {
  args: {
    count: 0,
    maxCount: 3,
  },
};

export const All: Story = {
  render: () => (
    <div className='bg-fill-secondary-500 flex items-start gap-x4 p-x4'>
      <DiaryPhotoAdd count={0} maxCount={3} />
      <DiaryPhotoAdd image={photo} />
    </div>
  ),
};
