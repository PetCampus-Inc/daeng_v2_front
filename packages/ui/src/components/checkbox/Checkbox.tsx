"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@daeng-design/react-checkbox"
import { Icon } from '@knockdog/ui'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from "@knockdog/ui/lib"

const checkboxVariants = cva(
  "flex shrink-0 items-center justify-center rounded-sm border border-line-400 bg-white data-[checked]:bg-orange-500 data-[checked]:border-orange-500",
  {
    variants: {
      size: {
        sm: "size-[20px]",
        md: "size-[25px]",
        lg: "size-[32px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const iconVariants = cva(
  "text-white",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root>, VariantProps<typeof checkboxVariants> {
  label?: string;
}

function Checkbox({
  className,
  label,
  children,
  size,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "flex items-center gap-2",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn(checkboxVariants({ size }))}
      >
        <Icon icon="Check" className={cn(iconVariants({ size }))} />
      </CheckboxPrimitive.Indicator>
      {label && <span className="text-sm text-gray-700">{label}</span>}
      {children}
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
