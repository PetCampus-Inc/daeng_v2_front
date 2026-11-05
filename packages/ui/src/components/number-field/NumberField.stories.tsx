import type { Meta, StoryObj } from '@storybook/nextjs';
import { NumberField } from './NumberField';

const meta = {
  title: 'Components/NumberField',
  component: NumberField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'filled', 'error'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: '10',
    unit: '마리',
    state: 'default',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col gap-8'>
      <NumberField defaultValue='10' unit='마리' state='default' />
      <NumberField defaultValue='10' unit='마리' state='filled' />
      <NumberField
        defaultValue='9'
        unit='마리'
        state='error'
        errorMessage='이미 10마리가 예약된 날이 있어 10마리보다 적게 정할 수 없어요.'
      />
    </div>
  ),
};
