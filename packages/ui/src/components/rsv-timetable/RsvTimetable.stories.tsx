import type { Meta, StoryObj } from '@storybook/nextjs';
import { RsvTimetable } from './RsvTimetable';

const meta = {
  title: 'Components/RsvTimetable',
  component: RsvTimetable,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[326px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RsvTimetable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    period: '오전',
  },
};
