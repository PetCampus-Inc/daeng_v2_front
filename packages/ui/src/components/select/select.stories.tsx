// Select.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from './Select';
import { useState } from 'react';

const meta: Meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Select 컴포넌트의 기본 플레이스홀더입니다.',
      defaultValue: 'Select an option',
    },
    options: {
      control: { type: 'object' },
      description: '옵션 리스트입니다.',
      defaultValue: ['Option 1', 'Option 2', 'Option 3'],
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 여부를 설정합니다.',
      defaultValue: false,
    },
  },
};

export default meta;

type SelectStoryArgs = {
  placeholder?: string;
  options?: string[];
  disabled?: boolean;
};

type Story = StoryObj<SelectStoryArgs>;

export const Default: Story = (args: SelectStoryArgs) => {
  const [value, setValue] = useState<string | undefined>(undefined);
  const placeholder = args.placeholder || 'Select an option';
  const options = args.options || ['Option 1', 'Option 2', 'Option 3'];

  return (
    <Select
      disabled={args.disabled}
      value={value}
      onValueChange={(selectedValue) => setValue(selectedValue)}
    >
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

Default.args = {
  placeholder: 'Select an option',
  options: ['Option 1', 'Option 2', 'Option 3'],
  disabled: false,
};

export const Disabled: Story = (args: SelectStoryArgs) => {
  const [value, setValue] = useState<string | undefined>(undefined);
  const placeholder = args.placeholder || 'Select an option';
  const options = args.options || ['Option 1', 'Option 2', 'Option 3'];

  return (
    <Select
      disabled={true}
      value={value}
      onValueChange={(selectedValue) => setValue(selectedValue)}
    >
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

Disabled.args = {
  placeholder: 'Select an option',
  options: ['Option 1', 'Option 2', 'Option 3'],
  disabled: true,
};
