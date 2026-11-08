import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryPhotoRemove } from './DiaryPhotoRemove';

const meta = {
  title: 'Components/DiaryPhotoRemove',
  component: DiaryPhotoRemove,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='bg-fill-secondary-500 p-x4'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiaryPhotoRemove>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
