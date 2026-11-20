import type { Meta, StoryObj } from '@storybook/nextjs';
import { TicketOptionCard } from './TicketOptionCard';

const meta = {
  title: 'Components/TicketOptionCard',
  component: TicketOptionCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TicketOptionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Custom: Story = {
  args: { title: '직접입력' },
};

export const CustomSelected: Story = {
  args: { title: '직접입력', selected: true },
};

export const Preset: Story = {
  args: { optionType: 'preset', title: '정기권 10회권' },
};

export const PresetSelected: Story = {
  args: { optionType: 'preset', title: '정기권 10회권', selected: true },
};
