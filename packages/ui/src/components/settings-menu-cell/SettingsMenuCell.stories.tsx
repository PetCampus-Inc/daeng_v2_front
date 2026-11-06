import type { Meta, StoryObj } from '@storybook/nextjs';
import { SettingsMenuCell } from './SettingsMenuCell';

const meta = {
  title: 'Components/SettingsMenuCell',
  component: SettingsMenuCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    menu: {
      control: 'select',
      options: ['notice', 'notification', 'terms'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsMenuCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    menu: 'notice',
  },
};

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col gap-2'>
      <SettingsMenuCell menu='notice' />
      <SettingsMenuCell menu='notification' />
      <SettingsMenuCell menu='terms' />
    </div>
  ),
};
