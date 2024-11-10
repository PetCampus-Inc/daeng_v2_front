import type { Meta, StoryObj } from '@storybook/react';
import { Input, type InputProps } from './index';
import { useState } from 'react';

const meta: Meta<InputProps> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    placeholder: { control: 'text' },
    format: {
      control: 'select',
      options: ['text', 'tel', 'number', 'alphanumeric'],
      description: '지정된 포맷으로 입력이 제한됩니다.',
      table: { defaultValue: { summary: 'text' } },
    },
    suffixElement: {
      control: false,
      description: '인풋 오른쪽에 추가로 표시되는 요소입니다.',
    },
  },
  args: {
    placeholder: '텍스트를 입력해 주세요.',
    format: 'text',
  },
};

export default meta;
type Story = StoryObj<InputProps>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const Password: Story = {
  name: 'Password Input',
  render: () => <Input.Password />,
};

export const Search: Story = {
  name: 'Search Input',
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Input.Search
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue('')}
      />
    );
  },
};
