import type { Meta, StoryObj } from '@storybook/react';
import { Button, ButtonProps } from './Button';

const meta: Meta<ButtonProps> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['fill', 'outline'],
      description: '버튼의 형태를 설정합니다. (primary 색상 스키마 제외)',
      table: { defaultValue: { summary: 'fill' } },
    },
    colorScheme: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'tertiary', 'destructive'],
      description: '버튼의 색상 스키마를 설정합니다.',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: { type: 'select' },
      options: [['sm', 'md', 'lg']],
      description: '버튼의 크기를 설정합니다.',
      table: { defaultValue: { summary: 'lg' } },
    },
    rounded: {
      control: { type: 'boolean' },
      description: '버튼의 둥근 모양을 설정합니다.',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    variant: 'fill',
    colorScheme: 'primary',
    size: 'lg',
    rounded: false,
    children: 'Button',
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

export const Default: Story = {};
