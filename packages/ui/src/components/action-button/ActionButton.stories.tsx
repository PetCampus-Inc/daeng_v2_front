import type { Meta, StoryObj } from '@storybook/react';
import { ActionButton } from './ActionButton';

const meta = {
  title: 'Components/ActionButton',
  component: ActionButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primaryFill',
        'primaryLine',
        'secondaryFill',
        'secondaryLine',
        'tertiaryFill',
      ],
      table: {
        type: {
          summary:
            '"primaryFill" | "primaryLine" | "secondaryFill" | "secondaryLine" | "tertiaryFill"',
        },
        defaultValue: { summary: '"primaryFill"' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      table: {
        type: { summary: '"small" | "medium" | "large"' },
        defaultValue: { summary: '"medium"' },
      },
    },
  },
} satisfies Meta<typeof ActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'primaryFill',
    size: 'medium',
    children: 'Action Button',
  },
};

export const PrimaryFill: Story = {
  args: {
    variant: 'primaryFill',
    size: 'medium',
    children: 'Action Button',
  },
};

export const PrimaryLine: Story = {
  args: {
    variant: 'primaryLine',
    size: 'medium',
    children: 'Action Button',
  },
};

export const SecondaryFill: Story = {
  args: {
    variant: 'secondaryFill',
    size: 'medium',
    children: 'Action Button',
  },
};

export const SecondaryLine: Story = {
  args: {
    variant: 'secondaryLine',
    size: 'medium',
    children: 'Action Button',
  },
};

export const TertiaryFill: Story = {
  args: {
    variant: 'tertiaryFill',
    size: 'medium',
    children: 'Action Button',
  },
};
