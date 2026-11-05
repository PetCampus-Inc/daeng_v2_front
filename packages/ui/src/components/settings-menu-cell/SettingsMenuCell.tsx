import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

const SETTINGS_MENU_LABEL = {
  notice: '공지사항',
  notification: '알림설정',
  terms: '이용약관',
} as const;

type SettingsMenu = keyof typeof SETTINGS_MENU_LABEL;

interface SettingsMenuCellProps extends Omit<ComponentProps<'button'>, 'children'> {
  menu?: SettingsMenu;
  children?: ReactNode;
}

/** V4 / Navigation / Settings Menu Cell */
function SettingsMenuCell({ menu = 'notice', children, className, type = 'button', ...props }: SettingsMenuCellProps) {
  return (
    <button
      type={type}
      className={cn('body1-medium text-text-primary bg-bg-0 flex w-full items-center py-x2 pr-x1 pl-x2', className)}
      {...props}
    >
      {children ?? SETTINGS_MENU_LABEL[menu]}
    </button>
  );
}

export { SettingsMenuCell };
export type { SettingsMenu, SettingsMenuCellProps };
