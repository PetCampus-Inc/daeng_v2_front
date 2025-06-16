import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedControl } from './index';

const meta: Meta<SegmentedControl.RootProps> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl.Root,
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
type Story = StoryObj<SegmentedControl.RootProps>;

export const Default: Story = {
  render: () => (
    <div className='w-full max-w-[580px]'>
      <SegmentedControl.Root defaultValue='current'>
        <SegmentedControl.Item value='current'>현 위치</SegmentedControl.Item>
        <SegmentedControl.Item value='home'>집</SegmentedControl.Item>
        <SegmentedControl.Item value='work'>직장</SegmentedControl.Item>
        <SegmentedControl.Item value='add'>+</SegmentedControl.Item>
      </SegmentedControl.Root>
    </div>
  ),
};

export const LongText: Story = {
  render: () => (
    <SegmentedControl.Root defaultValue='current'>
      <SegmentedControl.Item value='current'>현 위치</SegmentedControl.Item>
      <SegmentedControl.Item value='home'>집</SegmentedControl.Item>
      <SegmentedControl.Item value='work'>직장</SegmentedControl.Item>
      <SegmentedControl.Item value='custom'>
        새로 추가한 장소
      </SegmentedControl.Item>
    </SegmentedControl.Root>
  ),
};
