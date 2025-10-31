import type { Meta, StoryObj } from '@storybook/nextjs';
import { BottomSheet } from './index';
import { ActionButton } from '../action-button';

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
        <BottomSheet.Body>
          <BottomSheet.Handle />
          <BottomSheet.Header>
            <BottomSheet.Title>제목</BottomSheet.Title>
            <BottomSheet.CloseButton />
          </BottomSheet.Header>
          <BottomSheet.Content>컨텐츠 영역</BottomSheet.Content>
          <BottomSheet.Footer>
            <ActionButton>확인</ActionButton>
          </BottomSheet.Footer>
        </BottomSheet.Body>
      </BottomSheet.Portal>
    </BottomSheet.Root>
  ),
};
