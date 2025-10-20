import type { Meta, StoryObj } from '@storybook/nextjs';
import { SegmentedControl, SegmentedControlItem } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      type: 'string',
    },
    defaultValue: {
      type: 'string',
    },
    onValueChange: {
      table: {
        type: {
          summary: '((value: string) => void)',
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  render: () => (
    <div className='w-full max-w-[580px]'>
      <SegmentedControl defaultValue='current'>
        <SegmentedControlItem value='current'>현 위치</SegmentedControlItem>
        <SegmentedControlItem value='home'>집</SegmentedControlItem>
        <SegmentedControlItem value='work'>직장</SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};

export const LongText: Story = {
  render: () => (
    <SegmentedControl defaultValue='current'>
      <SegmentedControlItem value='current'>현 위치</SegmentedControlItem>
      <SegmentedControlItem value='home'>집</SegmentedControlItem>
      <SegmentedControlItem value='work'>직장</SegmentedControlItem>
      <SegmentedControlItem value='custom'>
        새로 추가한 장소
      </SegmentedControlItem>
    </SegmentedControl>
  ),
};
