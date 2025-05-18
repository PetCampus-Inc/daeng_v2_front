import * as icons from './components';
import { cn } from './lib';

export type IconType = keyof typeof icons;
export const iconTypes: IconType[] = Object.keys(icons) as IconType[];

export interface IconProps {
  icon: IconType;
  className?: string;
}

export function Icon({ icon, className }: IconProps) {
  const SVGIcon = icons[icon];
  return <SVGIcon className={cn('text-darkBlack size-6', className)} />;
}
