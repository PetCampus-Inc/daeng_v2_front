import { Meta, StoryObj } from '@storybook/react';
import { MultiCheck } from './MultiCheck';
import { useState } from 'react';

const meta: Meta<typeof MultiCheck> = {
  title: 'Components/MultiCheck',
  component: MultiCheck,
  tags: ['autodocs'],
  argTypes: {
    options: {
      control: { type: 'object' },
      description: '옵션 리스트를 설정합니다.',
      defaultValue: ['Option 1', 'Option 2', 'Option 3'],
    },
    selectedValues: {
      control: { type: 'object' },
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
    variant: {
      action: 'selected',
      description: '스타일을 지정합니다.',
      defaultValue: 'primary',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 여부를 설정합니다.',
      defaultValue: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof MultiCheck>;

export const Default: Story = {
  render: (args) => {
    const [values, setValues] = useState<string[]>([]);

    return (
      <MultiCheck
        {...args}
        variant='primary'
        options={['Option 1', 'Option 2', 'Option 3']}
        selectedValues={values}
        onSelect={(selectedValues) => setValues(selectedValues)}
      />
    );
  },
};

export const Secondary: Story = {
  args: {
    options: ['월', '화', '수', '목', '금', '토', '일'],
    variant: 'secondary',
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
    variant: 'primary',
    options: ['Custom 1', 'Custom 2', 'Custom 3'],
    selectedValues: ['Custom 2'],
  },
};
