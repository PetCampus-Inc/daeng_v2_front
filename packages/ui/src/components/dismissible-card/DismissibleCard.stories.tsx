import { Meta, StoryObj } from '@storybook/react';
import { DismissibleCard } from './DismissibleCard';

const meta: Meta<typeof DismissibleCard> = {
  title: 'Components/DismissibleCard',
  component: DismissibleCard,
  tags: ['autodocs'],
  argTypes: {
    onRemove: {
      action: 'removed',
      description: '삭제 버튼을 눌렀을때 호출되는 함수입니다.',
    },
    className: {
      constrol: 'text',
    },
  },
};

export default meta;

type Story = StoryObj<typeof DismissibleCard>;

export const Default: Story = {
  render: (args) => {
    return (
      <DismissibleCard {...args}>
        <span>1회</span>
      </DismissibleCard>
    );
  },
};

export const PhotoExample: Story = {
  render: (args) => {
    return (
      <DismissibleCard {...args} className='w-20 border-none p-0'>
        <img
          src='https://placehold.co/600x400'
          alt='Example'
          className='h-10 w-full rounded-md object-cover'
        />
      </DismissibleCard>
    );
  },
};

export const InteractiveExample: Story = {
  render: () => (
    <div className='flex gap-x-2'>
      {[1, 2, 3, 4].map((item) => (
        <DismissibleCard key={item} className='grow'>
          <p>Card {item}</p>
        </DismissibleCard>
      ))}
    </div>
  ),
};
