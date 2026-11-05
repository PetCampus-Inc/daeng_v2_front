import type { Meta, StoryObj } from '@storybook/nextjs';
import { SearchField } from './SearchField';

const meta = {
  title: 'Components/SearchField',
  component: SearchField,
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
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: '이름 혹은 견종을 입력해 주세요',
  },
};

export const Filled: Story = {
  args: {
    defaultValue: 'Name',
    placeholder: '이름 혹은 견종을 입력해 주세요',
  },
};
