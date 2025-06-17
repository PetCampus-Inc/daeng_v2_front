// Divider.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const isVertical = context.args.orientation === 'vertical';
      return (
        <div
          style={{
            padding: '1rem',
            ...(isVertical && { height: '200px' }), // vertical일 경우만 높이 설정
          }}
        >
          <Story />
        </div>
      );
    },
  ],
  argTypes: {
    orientation: {
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
    },
    variant: {
      control: { type: 'radio' },
      options: ['solid', 'dashed', 'dotted'],
    },
    dividerColor: {
      control: { type: 'radio' },
      options: ['default', 'subtle', 'accent'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    dividerColor: 'default',
    size: 'md',
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    variant: 'dotted',
    dividerColor: 'accent',
    size: 'lg',
  },
};

export const DashedSubtle: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'dashed',
    dividerColor: 'subtle',
    size: 'sm',
  },
};
