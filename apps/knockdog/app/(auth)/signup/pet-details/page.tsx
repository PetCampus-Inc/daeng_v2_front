'use client';

import React from 'react';
import { ProgressBar } from '@knockdog/ui';

const Page = () => {
  return (
    <div className='mt-[100px] px-4'>
      <ProgressBar totalSteps={5} value={5} />
    </div>
  );
};

export default Page;
