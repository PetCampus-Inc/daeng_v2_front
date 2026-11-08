import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiaryCalendar } from './DiaryCalendar';

const meta = {
  title: 'Components/DiaryCalendar',
  component: DiaryCalendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[390px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiaryCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

const today = new Date(2026, 10, 8);

function getJuneImage(date: Date) {
  if (date.getMonth() !== 5 || date.getDate() !== 23) return null;

  return <span className='bg-primitive-orange-300 block size-full' />;
}

export const Default: Story = {
  args: {
    defaultMonth: new Date(2026, 5, 1),
    defaultValue: new Date(2026, 5, 16),
    today,
    getImage: getJuneImage,
  },
};
