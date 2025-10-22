import type { Meta, StoryObj } from '@storybook/nextjs';
import { IconButton, type IconButtonProps } from './IconButton';
import { iconTypes } from '@knockdog/ui';

const meta: Meta<IconButtonProps> = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    icon: {
      control: 'select',
      options: iconTypes,
      description: '아이콘을 설정합니다.',
      table: { type: { summary: 'IconType' } },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: '버튼의 크기를 설정합니다.',
      table: { defaultValue: { summary: 'md' } },
    },
    pressEffect: {
      control: 'boolean',
      description: '클릭 이펙트 여부를 설정합니다.',
      table: { defaultValue: { summary: 'true' } },
    },
    iconClassName: {
      control: 'text',
      description: '아이콘 클래스를 설정합니다.',
    },
  },
  args: {
    icon: iconTypes[0],
    size: 'md',
    pressEffect: true,
  },
};

export default meta;
type Story = StoryObj<IconButtonProps>;

export const Default: Story = {};
