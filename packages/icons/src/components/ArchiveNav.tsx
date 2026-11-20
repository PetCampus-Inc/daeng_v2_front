import type { SVGProps } from 'react';

/** V4 / Icon / Guardian archive */
export function ArchiveNav({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='21'
      height='21'
      viewBox='0 0 21 21'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
      {...props}
    >
      <path
        d='M9.625 2.625V9.40713C9.62493 9.44844 9.63656 9.48894 9.65854 9.52392C9.68053 9.5589 9.71197 9.58694 9.74923 9.60479C9.78649 9.62264 9.82805 9.62958 9.86909 9.62479C9.91013 9.62001 9.94897 9.6037 9.98112 9.57775L11.9761 7.973C12.0539 7.91043 12.1507 7.87632 12.2504 7.87632C12.3502 7.87632 12.447 7.91043 12.5248 7.973L14.5198 9.57775C14.5519 9.60344 14.5907 9.61952 14.6316 9.62417C14.6725 9.62881 14.7139 9.62182 14.751 9.604C14.7881 9.58618 14.8194 9.55825 14.8413 9.52342C14.8633 9.4886 14.8749 9.44829 14.875 9.40713V2.625'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M4.375 2.625H16.625C17.5915 2.625 18.375 3.4085 18.375 4.375V16.625C18.375 17.5915 17.5915 18.375 16.625 18.375H4.375C3.4085 18.375 2.625 17.5915 2.625 16.625V4.375C2.625 3.4085 3.4085 2.625 4.375 2.625Z'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
