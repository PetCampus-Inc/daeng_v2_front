'use client';

function MypageSectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className='flex flex-col gap-3 px-4 py-5' aria-hidden='true'>
      <div className='bg-fill-secondary-50 h-5 w-24 animate-pulse rounded' />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className='bg-fill-secondary-50 h-12 w-full animate-pulse rounded' />
      ))}
    </div>
  );
}

export { MypageSectionSkeleton };
