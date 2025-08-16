import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    disabled: {
      description: '라디오 그룹의 비활성화 상태를 설정합니다',
      control: { type: 'boolean' },
    },
    required: {
      description: '라디오 그룹의 필수 입력 여부를 설정합니다',
      control: { type: 'boolean' },
    },
    name: {
      description: '라디오 그룹의 이름을 설정합니다',
      control: { type: 'text' },
    },
    value: {
      description: '현재 선택된 라디오 버튼의 값을 설정합니다',
      control: { type: 'text' },
    },
    onValueChange: {
      description: '라디오 버튼 선택 시 호출되는 콜백 함수입니다',
    },
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'options',
    value: 'option1',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="option1" id="option1">
        첫 번째 옵션
      </RadioGroupItem>
      <RadioGroupItem value="option2" id="option2">
        두 번째 옵션
      </RadioGroupItem>
      <RadioGroupItem value="option3" id="option3">
        세 번째 옵션
      </RadioGroupItem>
    </RadioGroup>
  ),
};

export const WithDefaultValue: Story = {
  args: {
    name: 'default-options',
    defaultValue: 'option2',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="option1" id="default-option1">
        기본값이 없는 옵션
      </RadioGroupItem>
      <RadioGroupItem value="option2" id="default-option2">
        기본값으로 선택된 옵션
      </RadioGroupItem>
      <RadioGroupItem value="option3" id="default-option3">
        다른 옵션
      </RadioGroupItem>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  args: {
    name: 'disabled-options',
    disabled: true,
    value: 'option1',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="option1" id="disabled-option1">
        비활성화된 옵션 1
      </RadioGroupItem>
      <RadioGroupItem value="option2" id="disabled-option2">
        비활성화된 옵션 2
      </RadioGroupItem>
      <RadioGroupItem value="option3" id="disabled-option3">
        비활성화된 옵션 3
      </RadioGroupItem>
    </RadioGroup>
  ),
};

export const MixedDisabled: Story = {
  args: {
    name: 'mixed-options',
    value: 'option1',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="option1" id="mixed-option1">
        활성화된 옵션 1
      </RadioGroupItem>
      <RadioGroupItem value="option2" id="mixed-option2" disabled>
        비활성화된 옵션 2
      </RadioGroupItem>
      <RadioGroupItem value="option3" id="mixed-option3">
        활성화된 옵션 3
      </RadioGroupItem>
    </RadioGroup>
  ),
};

export const Required: Story = {
  args: {
    name: 'required-options',
    required: true,
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="option1" id="required-option1">
        필수 선택 옵션 1
      </RadioGroupItem>
      <RadioGroupItem value="option2" id="required-option2">
        필수 선택 옵션 2
      </RadioGroupItem>
      <RadioGroupItem value="option3" id="required-option3">
        필수 선택 옵션 3
      </RadioGroupItem>
    </RadioGroup>
  ),
};

