import type { Meta, StoryObj } from '@storybook/react';
import { FloatingActionButton } from './FloatingActionButton';
import { iconTypes } from '../icon';
import { Float } from '../float/Float';

const meta: Meta<typeof FloatingActionButton> = {
  title: 'Components/FloatingActionButton',
  component: FloatingActionButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      table: {
        type: { summary: 'primarySolid | neutralSolid | neutralLight' },
        defaultValue: { summary: 'primarySolid' },
      },
      options: ['primarySolid', 'neutralSolid', 'neutralLight'],
      control: { type: 'select' },
    },
    extended: {
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
      control: { type: 'boolean' },
    },
    label: {
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'null' },
      },
      control: { type: 'text' },
    },
    icon: {
      table: {
        type: { summary: 'iconTypes' },
      },
      control: { type: 'select' },
      options: iconTypes,
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[350px]'>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FloatingActionButton>;

export const Default: Story = {
  args: {
    extended: true,
    label: '추가하기',
    icon: 'Plus',
  },
};

export const Extended: Story = {
  args: {
    label: '추가하기',
    icon: 'Plus',
  },
  render: (args) => (
    <div className='gap-x2 flex'>
      <FloatingActionButton {...args} />
      <FloatingActionButton {...args} extended={false} />
    </div>
  ),
};

export const WithFloat: Story = {
  args: {
    label: '목록보기',
    variant: 'neutralSolid',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`FloatingActionButton` 컴포넌트는 `Float` 컴포넌트와 함께 사용하는걸 권장합니다.',
      },
    },
  },
  render: (args) => (
    <div className='border-line-100 relative h-[500px] w-[350px] border'>
      <Float placement='bottom-end' offsetX='x4' offsetY='x4'>
        <FloatingActionButton icon='List' {...args} />
      </Float>
    </div>
  ),
};
