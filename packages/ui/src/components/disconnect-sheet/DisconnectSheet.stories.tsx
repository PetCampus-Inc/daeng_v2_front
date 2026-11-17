import type { Meta, StoryObj } from '@storybook/nextjs';
import { DisconnectSheet } from './DisconnectSheet';

const meta = {
  title: 'Components/DisconnectSheet',
  component: DisconnectSheet,
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
} satisfies Meta<typeof DisconnectSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const manyTickets = Array.from({ length: 4 }, () => ({ kind: 'pass' as const }));

export const Default: Story = {};

export const All: Story = {
  render: () => (
    <div className='bg-fill-secondary-100 flex w-[390px] flex-col gap-x6 py-x4'>
      <DisconnectSheet />
      <DisconnectSheet tickets={manyTickets} isScrollable />
    </div>
  ),
};
