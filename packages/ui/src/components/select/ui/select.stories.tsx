import { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './select';
import { useState } from 'react';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
      description: '현재 선택된 값입니다.',
    },
    onValueChange: {
      action: 'changed',
      description: '값이 변경될 때 호출되는 함수입니다.',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 여부를 설정합니다.',
      defaultValue: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: (args) => {
    const [selectedValue, setSelectedValue] = useState<string | undefined>(
      undefined
    );

    return (
      <Select
        {...args}
        value={selectedValue}
        onValueChange={(value, label) => setSelectedValue(value)}
      >
        <SelectTrigger className='w-[200px]'>
          <SelectValue placeholder='선택해주세요' />
        </SelectTrigger>
        <SelectContent>
          {['Option 1', 'Option 2', 'Option 3'].map((option, index) => (
            <SelectItem key={index} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithCustomOptions: Story = {
  render: (args) => {
    const [selectedValue, setSelectedValue] = useState<string | undefined>(
      'Custom 2'
    );

    return (
      <Select
        {...args}
        value={selectedValue}
        onValueChange={(value, label) => setSelectedValue(value)}
      >
        <SelectTrigger className='w-[200px]'>
          <SelectValue placeholder='선택해주세요' />
        </SelectTrigger>
        <SelectContent>
          {['Custom 1', 'Custom 2', 'Custom 3'].map((option, index) => (
            <SelectItem key={index} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
};
