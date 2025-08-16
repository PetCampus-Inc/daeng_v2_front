import type { HTMLAttributes } from 'react';

type Booleanish = boolean | 'true' | 'false';

export function dataAttr(guard: boolean | undefined) {
  return guard ? '' : undefined;
}

export function ariaAttr(guard: boolean | undefined): Booleanish | undefined {
  return guard ? 'true' : undefined;
}

type DataAttr = { [key in `data-${string}`]?: string | undefined };
type WithoutRef<T> = Omit<T, 'ref'>;

export const elementProps = <T extends HTMLAttributes<any>>(
  props: T & DataAttr
): T => props;

export const buttonProps = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & DataAttr
): WithoutRef<React.ButtonHTMLAttributes<HTMLButtonElement>> => props;

export const labelProps = (
  props: React.LabelHTMLAttributes<HTMLLabelElement> & DataAttr,
): WithoutRef<React.LabelHTMLAttributes<HTMLLabelElement>> => props;

export const inputProps = (
  props: React.InputHTMLAttributes<HTMLInputElement> & DataAttr,
): WithoutRef<React.InputHTMLAttributes<HTMLInputElement>> => props;