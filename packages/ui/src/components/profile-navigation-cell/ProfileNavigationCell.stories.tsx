import type { Meta, StoryObj } from '@storybook/nextjs';
import profile from './profile.png';
import { ProfileNavigationCell } from './ProfileNavigationCell';

const avatarSrc = typeof profile === 'string' ? profile : profile.src;

const meta = {
  title: 'Components/ProfileNavigationCell',
  component: ProfileNavigationCell,
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
} satisfies Meta<typeof ProfileNavigationCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: '이름',
    avatarSrc,
    avatarAlt: '프로필',
    role: '원장',
  },
};
