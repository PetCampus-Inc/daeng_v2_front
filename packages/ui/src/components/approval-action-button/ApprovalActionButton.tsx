import { type ComponentProps, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@knockdog/ui/lib';

const approvalActionButtonVariants = cva('body1-bold radius-r2 inline-flex items-center justify-center px-x4 py-x2', {
  variants: {
    action: {
      reject: 'text-fill-secondary-500',
      approve: 'text-text-accent',
    },
    state: {
      default: '',
      pressed: '',
    },
  },
  compoundVariants: [
    { action: 'reject', state: 'default', class: 'bg-bg-100 active:bg-fill-secondary-300' },
    { action: 'reject', state: 'pressed', class: 'bg-fill-secondary-300' },
    { action: 'approve', state: 'default', class: 'bg-primitive-orange-100 active:bg-primitive-orange-200' },
    { action: 'approve', state: 'pressed', class: 'bg-primitive-orange-200' },
  ],
  defaultVariants: {
    action: 'reject',
    state: 'default',
  },
});

const APPROVAL_ACTION_LABEL = {
  reject: '거절',
  approve: '승인',
} as const;

type ApprovalAction = keyof typeof APPROVAL_ACTION_LABEL;
type ApprovalActionState = 'default' | 'pressed';

interface ApprovalActionButtonProps
  extends Omit<ComponentProps<'button'>, 'children'>,
    VariantProps<typeof approvalActionButtonVariants> {
  action?: ApprovalAction;
  state?: ApprovalActionState;
  children?: ReactNode;
}

/** V4 / Button / Approval Action */
function ApprovalActionButton({
  action = 'reject',
  state = 'default',
  children,
  className,
  type = 'button',
  ...props
}: ApprovalActionButtonProps) {
  return (
    <button type={type} className={cn(approvalActionButtonVariants({ action, state }), className)} {...props}>
      {children ?? APPROVAL_ACTION_LABEL[action]}
    </button>
  );
}

export { ApprovalActionButton, approvalActionButtonVariants };
export type { ApprovalAction, ApprovalActionButtonProps, ApprovalActionState };
