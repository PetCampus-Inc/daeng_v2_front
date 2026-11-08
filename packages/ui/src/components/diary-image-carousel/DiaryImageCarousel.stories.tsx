import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryImageCarousel } from './DiaryImageCarousel';

const meta = {
  title: 'Components/DiaryImageCarousel',
  component: DiaryImageCarousel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DiaryImageCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const images = ['bg-primitive-orange-200', 'bg-primitive-orange-300', 'bg-primitive-orange-400'].map((color) => (
  <span key={color} className={`${color} block size-full`} />
));

export const Default: Story = {
  args: {
    images,
    defaultValue: 0,
  },
};

export const All: Story = {
  render: () => (
    <div className='flex flex-col gap-x4'>
      <DiaryImageCarousel images={images} defaultValue={0} />
      <DiaryImageCarousel images={images} defaultValue={1} />
      <DiaryImageCarousel images={images} defaultValue={2} />
    </div>
  ),
};
