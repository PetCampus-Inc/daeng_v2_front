import type { Meta, StoryObj } from '@storybook/react';
import { BottomSheet } from './index';
import { IconButton } from '../icon-button';

const meta: Meta<BottomSheet.RootProps> = {
  title: 'Components/BottomSheet',
  component: BottomSheet.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '아직 작성 중이에요',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<BottomSheet.RootProps>;

export const Default: Story = {
  render: () => (
    <BottomSheet.Root>
      <BottomSheet.Trigger asChild>
        <button className='font-regular relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:text-white dark:hover:bg-[#1A1A19]'>
          Open Drawer
        </button>
      </BottomSheet.Trigger>
      <BottomSheet.Content>
        <BottomSheet.Handle />
        <BottomSheet.Header>
          <BottomSheet.Title>Title</BottomSheet.Title>
          <BottomSheet.Close
            asChild
            className='absolute right-4 flex items-center justify-center'
          >
            <IconButton icon='Close' />
          </BottomSheet.Close>
        </BottomSheet.Header>
        <div className='px-x4 pt-x7 pb-x10'>
          <div className='bg-primitive-neutral-300 h-[400px] w-full' />
        </div>
      </BottomSheet.Content>
    </BottomSheet.Root>
  ),
};
