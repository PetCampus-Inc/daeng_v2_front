/** Bell (BellDot에서 점만 뺀 모양) */
export function BellLine(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M10.268 21C10.443 21.304 10.696 21.5565 11 21.732C11.304 21.9075 11.649 21.9999 12 21.9999C12.351 21.9999 12.696 21.9075 13 21.732C13.304 21.5565 13.556 21.304 13.732 21'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M3.262 15.326A1 1 0 0 0 4 17H20A1 1 0 0 0 20.74 15.327C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8C6 12.499 4.589 13.956 3.262 15.326Z'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
