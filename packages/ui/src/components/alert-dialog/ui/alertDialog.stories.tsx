// Dialog.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ActionDialog } from './ActionDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from '../../button';

const meta = {
  title: 'Components/AlertDialog',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
         모달 다이얼로그 컴포넌트입니다. Radix UI의 Alert Dialog를 기반으로 구현되었으며,
         ActionDialog와 ConfirmDialog 두 가지 변형을 제공합니다.
         
         - ActionDialog: 단일 액션 버튼을 가진 다이얼로그
         - ConfirmDialog: 확인/취소 두 개의 버튼을 가진 다이얼로그

         제어/비제어 방식 모두 지원합니다.
       `,
      },
    },
  },
  argTypes: {
    // 공통 props
    open: {
      control: { type: 'boolean' },
      description: '다이얼로그의 열림/닫힘 상태 (제어 컴포넌트용)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'undefined' },
      },
    },
    defaultOpen: {
      control: { type: 'boolean' },
      description: '초기 열림 상태 (비제어 컴포넌트용)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    title: {
      control: { type: 'text' },
      description: '다이얼로그의 제목',
      table: {
        type: { summary: 'string' },
      },
    },
    description: {
      control: { type: 'text' },
      description: '다이얼로그의 내용',
      table: {
        type: { summary: 'string' },
      },
    },
    onOpenChange: {
      description: '다이얼로그의 열림/닫힘 상태가 변경될 때 호출되는 함수',
      table: {
        type: { summary: '(open: boolean) => void' },
      },
    },

    // ActionDialog 전용 props
    actionText: {
      control: { type: 'text' },
      description: '액션 버튼의 텍스트',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '확인' },
      },
    },
    onAction: {
      description: '액션 버튼 클릭 시 호출되는 함수',
      table: {
        type: { summary: '() => void' },
      },
    },

    // ConfirmDialog 전용 props
    confirmText: {
      control: { type: 'text' },
      description: '확인 버튼의 텍스트',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '확인' },
      },
    },
    cancelText: {
      control: { type: 'text' },
      description: '취소 버튼의 텍스트',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '취소' },
      },
    },
    onConfirm: {
      description: '확인 버튼 클릭 시 호출되는 함수',
      table: {
        type: { summary: '() => void' },
      },
    },
    onCancel: {
      description: '취소 버튼 클릭 시 호출되는 함수',
      table: {
        type: { summary: '() => void' },
      },
    },
  },
} satisfies Meta;

export default meta;

// ActionDialog Stories
export const ActionDialogControlled: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
        <ActionDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          title='알림'
          description='작업이 완료되었습니다.'
          actionText='확인'
          onAction={() => console.log('action clicked')}
        />
      </div>
    );
  },
  name: 'ActionDialog (Controlled)',
};

// ConfirmDialog Stories
export const ConfirmDialogControlled: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
        <ConfirmDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          title='확인'
          description='변경사항을 저장하시겠습니까?'
          confirmText='저장'
          cancelText='취소'
          onConfirm={() => console.log('confirmed')}
          onCancel={() => console.log('cancelled')}
        />
      </div>
    );
  },
  name: 'ConfirmDialog',
};
