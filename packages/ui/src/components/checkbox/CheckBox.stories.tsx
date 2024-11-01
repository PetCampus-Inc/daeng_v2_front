import { Meta, StoryObj } from '@storybook/react';
import { CheckBox } from './CheckBox';
import { useState } from 'react';

const meta: Meta<typeof CheckBox> = {
  title: 'Components/CheckBox',
  component: CheckBox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    checked: {
      control: 'boolean',
      description: '체크 여부를 설정합니다.',
      defaultValue: false,
    },
    label: {
      control: 'text',
      description: '체크박스 라벨을 설정합니다.',
    },
    id: {
      control: 'text',
      description: '체크박스 id를 설정합니다.',
    },
    onChange: {
      action: 'changed',
      description: '체크박스 상태가 변경될 때 호출되는 함수입니다.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof CheckBox>;
export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);

    return (
      <CheckBox
        {...args}
        checked={checked}
        onChange={() => setChecked((prev) => !prev)}
      />
    );
  },
  args: {
    label: 'CheckBox',
    id: 'default',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    checked: false,
    label: 'CheckBox',
    id: 'disabled',
  },
};

export const WithLongLabel: Story = {
  args: {
    label: 'This is a long label for CheckBox',
    id: 'long-label',
  },
};
