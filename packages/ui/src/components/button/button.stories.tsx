import type { Meta, StoryObj } from '@storybook/react';
import { Button, ButtonProps } from '.';

// Meta 설정
const meta: Meta<ButtonProps> = {
  title: 'Components/Button', // Storybook에서의 경로
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    rounded: {
      control: { type: 'boolean' },
    },
    asChild: {
      control: { type: 'boolean' },
    },
  },
  args: {
    variant: 'primary',
    size: 'lg',
    rounded: false,
    children: 'Button', // 기본 버튼 텍스트
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

// 기본 스토리
export const Default: Story = {};

// 다양한 변형 예시
export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Rounded: Story = {
  args: {
    rounded: true,
  },
};
