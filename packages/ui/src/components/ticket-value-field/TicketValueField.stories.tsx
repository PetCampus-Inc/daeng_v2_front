import type { Meta, StoryObj } from '@storybook/nextjs';
import { TicketValueField } from './TicketValueField';

const meta = {
  title: 'Components/TicketValueField',
  component: TicketValueField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['placeholder', 'filled', 'selected'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TicketValueField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    state: 'placeholder',
    placeholder: '날짜를 선택하세요',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col gap-4'>
      <TicketValueField state='placeholder' placeholder='날짜를 선택하세요' />
      <TicketValueField state='filled' value='2027.11.01' />
      <TicketValueField state='selected' value='정기 10회권' />
    </div>
  ),
};
