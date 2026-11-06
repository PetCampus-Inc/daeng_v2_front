'use client';

function OwnerKindergartenCardSkeleton() {
  return (
    <div className='flex flex-col pt-4 pb-5' aria-hidden='true'>
      <div className='w-full px-4'>
        <div className='radius-r3 bg-fill-secondary-50 h-[126px] w-full animate-pulse' />
      </div>
      <div className='flex w-full items-center justify-between gap-x-7 p-4'>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='bg-fill-secondary-50 h-6 w-2/3 animate-pulse rounded' />
          <div className='bg-fill-secondary-50 h-4 w-full animate-pulse rounded' />
        </div>
        <div className='bg-fill-secondary-50 size-6 shrink-0 animate-pulse rounded' />
      </div>
    </div>
  );
}

export { OwnerKindergartenCardSkeleton };
