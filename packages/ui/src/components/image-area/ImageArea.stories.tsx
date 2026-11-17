import type { Meta, StoryObj } from '@storybook/nextjs';
import { ImageArea } from './ImageArea';

const meta = {
  title: 'Components/ImageArea',
  component: ImageArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ImageArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ImageArea className='h-[180px] w-[358px]'>
      <div className='bg-fill-secondary-100 size-full' />
    </ImageArea>
  ),
};
