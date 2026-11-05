import type { Meta, StoryObj } from '@storybook/nextjs';
import { SortDropdown } from './SortDropdown';

const meta = {
  title: 'Components/SortDropdown',
  component: SortDropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SortDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
};

export const Name: Story = {
  args: { defaultValue: 'name', defaultOpen: true },
};

export const Oldest: Story = {
  args: { defaultValue: 'oldest', defaultOpen: true },
};
