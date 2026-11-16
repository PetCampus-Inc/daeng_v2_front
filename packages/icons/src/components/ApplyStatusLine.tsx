/** 보호자 마이페이지 '연결 신청 현황' 메뉴 아이콘. 색은 currentColor라 text-* 토큰으로 칠한다. */
export function ApplyStatusLine(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M12 2C13.9401 1.99965 15.8385 2.56368 17.4637 3.62336C19.0889 4.68303 20.3707 6.19259 21.153 7.96804C21.9352 9.74349 22.1841 11.7082 21.8693 13.6226C21.5545 15.537 20.6896 17.3185 19.38 18.75'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M12 8V16' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M16 12H8' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M2.5 8.875C2.18135 9.84366 2.01273 10.8554 2 11.875'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M2.83008 16C3.39158 17.2918 4.21966 18.4505 5.26008 19.4'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M4.63574 5.23493C4.91478 4.93116 5.21235 4.64495 5.52674 4.37793'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8.64355 21.42C11.1373 22.3084 13.8815 22.1718 16.2746 21.04'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
