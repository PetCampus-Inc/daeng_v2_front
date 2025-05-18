import type { Meta, StoryObj } from '@storybook/react';
import { Icon, IconProps, iconTypes } from './Icon';

const meta: Meta<IconProps> = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    icon: {
      control: { type: 'select' },
      options: iconTypes,
    },
  },
  args: {
    icon: iconTypes[0],
  },
};

export default meta;
type Story = StoryObj<IconProps>;

export const Default: Story = {};
