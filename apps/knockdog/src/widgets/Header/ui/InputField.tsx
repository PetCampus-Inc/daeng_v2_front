'use client';

import { cn } from '@knockdog/ui/lib';

export default function InputField({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className='relative w-full'>
      <div className='pointer-events-none absolute inset-y-0 left-3 flex items-center'>
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z'
            stroke='#333333'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M21 21L16.65 16.65'
            stroke='#333333'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
      <input
        type='text'
        placeholder='업체 또는 주소를 검색하세요'
        className={cn(
          'h-12 w-full rounded-md border border-[#424650] bg-white py-2 pl-10 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300',
          className
        )}
        {...props}
      />
    </div>
  );
}
