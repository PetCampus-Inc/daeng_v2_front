import type { Meta, StoryObj } from '@storybook/react';
import { Badge, type BadgeProps } from './Badge';

const meta: Meta<BadgeProps> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'default',
        'primary',
        'outline',
        'secondary',
        'tertiary',
        'success',
        'destructive',
      ],
    },
    shape: {
      control: { type: 'select' },
      options: ['square', 'rounded'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    bold: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<BadgeProps>;

export const Default: Story = {
  args: {
    children: 'Default Badge',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Badge',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Badge',
  },
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    children: 'Tertiary Badge',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Badge',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive Badge',
  },
};

export const Square: Story = {
  args: {
    variant: 'default',
    shape: 'square',
    children: 'Square Badge',
  },
};

export const Rounded: Story = {
  args: {
    variant: 'default',
    shape: 'rounded',
    children: 'Rounded Badge',
  },
};

export const Small: Story = {
  args: {
    variant: 'default',
    size: 'sm',
    children: 'Small Badge',
  },
};

export const Medium: Story = {
  args: {
    variant: 'default',
    size: 'md',
    children: 'Medium Badge',
  },
};

export const Large: Story = {
  args: {
    variant: 'default',
    size: 'lg',
    children: 'Large Badge',
  },
};

export const Bold: Story = {
  args: {
    variant: 'default',
    bold: true,
    children: 'Bold Badge',
  },
};
