import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryPhotoAddList } from './DiaryPhotoAddList';

const meta = {
  title: 'Components/DiaryPhotoAddList',
  component: DiaryPhotoAddList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='bg-fill-secondary-500 pr-[6px] pt-[6px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiaryPhotoAddList>;

export default meta;
type Story = StoryObj<typeof meta>;

const photos = ['bg-primitive-orange-200', 'bg-primitive-orange-300', 'bg-primitive-orange-400'] as const;

export const Default: Story = {
  args: {
    items: photos.map((color, index) => ({
      id: String(index + 1),
      image: <span className={`${color} block size-full`} />,
    })),
  },
};
