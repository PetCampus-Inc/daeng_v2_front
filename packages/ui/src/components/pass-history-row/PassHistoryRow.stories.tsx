import type { Meta, StoryObj } from '@storybook/nextjs';
import { PassHistoryRow } from './PassHistoryRow';

const meta = {
  title: 'Components/PassHistoryRow',
  component: PassHistoryRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    kind: {
      control: 'select',
      options: ['use', 'canceled', 'period', 'charged', 'extension'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PassHistoryRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    kind: 'use',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col'>
      <PassHistoryRow kind='use' />
      <PassHistoryRow kind='canceled' />
      <PassHistoryRow kind='period' />
      <PassHistoryRow kind='charged' />
      <PassHistoryRow kind='extension' />
    </div>
  ),
};
