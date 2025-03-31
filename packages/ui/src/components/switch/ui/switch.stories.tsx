import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    defaultChecked: false,
  },
  argTypes: {
    defaultChecked: {
      control: 'boolean',
      description: '(비제어) 스위치가 처음 렌더링될 때의 상태',
    },
    checked: {
      control: 'boolean',
      description: '(제어) 스위치의 현재 상태',
    },
    onCheckedChange: {
      description: '스위치 상태가 변경될 때 호출되는 함수입니다.',
      action: 'changed',
    },
    disabled: {
      control: 'boolean',
      description: '스위치를 비활성화합니다.',
    },
    required: {
      control: 'boolean',
      description: '스위치가 필수 입력 요소임을 나타냅니다.',
    },
    name: {
      control: 'text',
      description: '폼 제출 시 사용되는 이름',
    },
    value: {
      control: 'text',
      description: '제출할 때 데이터로 제공되는 값',
      defaultValue: 'on',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    defaultChecked: true,
  },
};
