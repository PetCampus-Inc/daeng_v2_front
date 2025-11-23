'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@knockdog/ui/lib';

function Avatar({ className, ...restProps }: AvatarPrimitive.AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot='avatar'
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...restProps}
    />
  );
}

function AvatarImage({ className, ...restProps }: AvatarPrimitive.AvatarImageProps) {
  return <AvatarPrimitive.Image data-slot='avatar-image' className={cn('size-full', className)} {...restProps} />;
}

function AvatarFallback({ className, ...restProps }: AvatarPrimitive.AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot='avatar-fallback'
      className={cn('text-text-secondary-inverse flex size-full items-center justify-center bg-neutral-50', className)}
      {...restProps}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
