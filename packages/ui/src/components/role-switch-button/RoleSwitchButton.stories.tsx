import type { Meta, StoryObj } from '@storybook/nextjs';
import { RoleSwitchButton } from './RoleSwitchButton';

const meta = {
  title: 'Components/RoleSwitchButton',
  component: RoleSwitchButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[390px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RoleSwitchButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
