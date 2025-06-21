'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@knockdog/ui/lib';

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root data-slot='tabs' className={cn(className)} {...props} />
  );
}

function TabsList({
  className,
  scrollable = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  scrollable?: boolean;
}) {
  return (
    <TabsPrimitive.List
      data-slot='tabs-list'
      className={cn(
        'border-b-1 border-line-200 flex px-4',
        scrollable && [
          'overflow-x-auto',
          '[&::-webkit-scrollbar]:hidden',
          '[-ms-overflow-style:none]',
          '[scrollbar-width:none]',
        ],
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      className={cn(
        'data-[state=active]:text-text-accent body2-semibold data-[state=active]:border-b-line-accent border-b-3 flex-1 whitespace-nowrap border-b-transparent p-4 pb-3 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot='tabs-content'
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
