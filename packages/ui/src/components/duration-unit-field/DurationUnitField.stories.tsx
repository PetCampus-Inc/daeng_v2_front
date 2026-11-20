import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { DurationUnitField, type DurationUnit } from './DurationUnitField';

const meta = {
  title: 'Components/DurationUnitField',
  component: DurationUnitField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    unit: {
      control: 'select',
      options: ['day', 'month'],
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[358px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DurationUnitField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    unit: 'day',
    defaultValue: '0',
  },
};

function DurationPreview({ unit: initialUnit }: { unit: DurationUnit }) {
  const [unit, setUnit] = useState(initialUnit);

  return <DurationUnitField unit={unit} onUnitChange={setUnit} defaultValue='0' />;
}

export const All: Story = {
  render: () => (
    <div className='flex w-[358px] flex-col gap-4'>
      <DurationPreview unit='day' />
      <DurationPreview unit='month' />
    </div>
  ),
};
