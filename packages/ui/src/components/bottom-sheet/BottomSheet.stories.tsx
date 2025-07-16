import type { Meta, StoryObj } from '@storybook/react';
import { BottomSheet } from './index';
import { ActionButton } from '../action-button';
import { Icon } from '../icon';

const meta: Meta<typeof BottomSheet.Root> = {
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
type Story = StoryObj<typeof BottomSheet.Root>;

export const Default: Story = {
  render: () => (
    <BottomSheet.Root>
      <BottomSheet.Trigger asChild>
        <ActionButton>Open Drawer</ActionButton>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content>
          <BottomSheet.Handle />
          <BottomSheet.Header>
            <BottomSheet.Title>제목</BottomSheet.Title>
            <BottomSheet.Close className='absolute right-4 flex cursor-pointer items-center justify-center'>
              <Icon icon='Close' />
            </BottomSheet.Close>
          </BottomSheet.Header>
          <div className='px-x4 pt-x3'>컨텐츠 영역</div>
          <BottomSheet.Footer>
            <ActionButton>확인</ActionButton>
          </BottomSheet.Footer>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet.Root>
  ),
};
