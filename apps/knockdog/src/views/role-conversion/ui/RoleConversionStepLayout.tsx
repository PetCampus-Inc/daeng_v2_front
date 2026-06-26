'use client';

import type { ReactNode } from 'react';

import { ProgressBar } from '@knockdog/ui';

import { Header } from '@widgets/Header';

import { roleConversionProgress } from '@views/role-conversion/config/roleConversionProgress';

interface RoleConversionStepLayoutProps {
  headerTitle: string;
  step: number;
  titleLine1: string;
  titleLine2: string;
  children: ReactNode;
  footer?: ReactNode;
}

function RoleConversionStepLayout({
  headerTitle,
  step,
  titleLine1,
  titleLine2,
  children,
  footer,
}: RoleConversionStepLayoutProps) {
  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.BackButton />
        <Header.Title>{headerTitle}</Header.Title>
      </Header>

      <div className='shrink-0 px-4 py-2'>
        <ProgressBar
          totalSteps={roleConversionProgress.totalSteps}
          value={step}
          className='h-1.5'
        />
      </div>

      <div className='flex min-h-0 flex-1 flex-col px-4 pt-3 pb-5'>
        <div className='flex flex-col gap-5'>
          <h1 className='h1-extrabold'>
            {titleLine1}
            <br />
            {titleLine2}
          </h1>

          {children}
        </div>

        {footer ? <div className='mt-auto py-5'>{footer}</div> : null}
      </div>
    </div>
  );
}

export { RoleConversionStepLayout };
