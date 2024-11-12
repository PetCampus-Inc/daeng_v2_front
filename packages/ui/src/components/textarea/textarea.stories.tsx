import type { Meta, StoryObj } from '@storybook/react';
import { Textarea, type TextareaProps } from './Textarea';

const meta: Meta<TextareaProps> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    placeholder: { control: 'text', description: '텍스트를 입력하세요.' },
    disabled: {
      control: 'boolean',
      description: '비활성화 여부를 설정합니다.',
    },
    rows: { control: 'number', description: '행 수를 설정합니다.' },
    cols: { control: 'number', description: '열 수를 설정합니다.' },
    className: {
      control: 'text',
      description: '커스텀 클래스 네임을 설정합니다.',
    },
  },
  args: {
    placeholder: '텍스트를 입력해 주세요.',
    rows: 4,
    cols: 40,
  },
};

export default meta;
type Story = StoryObj<TextareaProps>;

export const Default: Story = {};

export const WithText: Story = { args: { value: 'Initial text content' } };

export const Disabled: Story = {
  args: { disabled: true, value: 'This textarea is disabled' },
};

export const CustomClassName: Story = {
  args: {
    value: 'Textarea with custom class',
    className: 'bg-yellow-100 border-blue-500',
  },
};
