import type { Meta, StoryObj } from '@storybook/nextjs';
import { Chip } from './ToggleChip';
import { Icon } from '../icon';

const meta: Meta<typeof Chip.Toggle> = {
  title: 'Components/Chip.Toggle',
  component: Chip.Toggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['outline'],
      table: {
        type: { summary: '"outline"' },
        defaultValue: { summary: '"outline"' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    checked: {
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof Chip.Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Chip.Toggle {...args}>
      <Chip.Label>Label</Chip.Label>
    </Chip.Toggle>
  ),
  args: {
    variant: 'outline',
  },
};

export const Variants: Story = {
  render: () => (
    <div className='flex gap-2'>
      <Chip.Toggle variant='outline'>
        <Chip.Label>Outline</Chip.Label>
      </Chip.Toggle>
      <Chip.Toggle variant='outline' checked>
        <Chip.Label>Checked</Chip.Label>
      </Chip.Toggle>
      <Chip.Toggle variant='outline' disabled>
        <Chip.Label>Disabled</Chip.Label>
      </Chip.Toggle>
    </div>
  ),
};

export const PrefixIcon: Story = {
  render: (args) => (
    <Chip.Toggle {...args}>
      <Chip.PrefixIcon>
        <Icon icon='Plus' className='size-4' />
      </Chip.PrefixIcon>
      <Chip.Label>추가하기</Chip.Label>
    </Chip.Toggle>
  ),
  args: {
    variant: 'outline',
  },
};

export const SuffixIcon: Story = {
  render: (args) => (
    <Chip.Toggle {...args}>
      <Chip.Label>삭제하기</Chip.Label>
      <Chip.SuffixIcon>
        <Icon icon='Close' className='size-4' />
      </Chip.SuffixIcon>
    </Chip.Toggle>
  ),
  args: {
    variant: 'outline',
  },
};
