import type { Meta, StoryObj } from '@storybook/react';
import { SingleRadio } from './SingleRadio';
import { useState } from 'react';

const meta: Meta<typeof SingleRadio> = {
  title: 'Components/SingleRadio',
  component: SingleRadio,
  tags: ['autodocs'],
  argTypes: {
    options: {
      control: { type: 'object' },
      description: '옵션 리스트를 설정합니다.',
      defaultValue: ['Option 1', 'Option 2', 'Option 3'],
    },
    value: {
      control: 'text',
      description: '현재 선택된 값입니다.',
    },
    onSelect: {
      action: 'selected',
      description: '옵션을 선택할 때 호출되는 함수입니다.',
    },
    asChild: {
      control: 'boolean',
      description: 'Slot을 사용하도록 설정합니다.',
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 여부를 설정합니다.',
      defaultValue: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof SingleRadio>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>(null);

    return (
      <SingleRadio
        {...args}
        options={['Option 1', 'Option 2', 'Option 3']}
        value={value}
        onSelect={(selectedValue) => setValue(selectedValue)}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    options: ['Option 1', 'Option 2', 'Option 3'],
  },
};

export const WithCustomOptions: Story = {
  args: {
    options: ['Custom 1', 'Custom 2', 'Custom 3'],
    value: 'Custom 2',
  },
};
