import type { Meta, StoryObj } from '@storybook/nextjs';
import cover from './cover.png';
import { SectionHeader } from './SectionHeader';

const imageSrc = typeof cover === 'string' ? cover : cover.src;

const meta = {
  title: 'Components/SectionHeader',
  component: SectionHeader,
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
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '모모네 유치원',
    address: '서울 강남구 논현로 123길 37',
    imageSrc,
    imageAlt: '모모네 유치원',
  },
};
