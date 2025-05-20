export function Time(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <circle cx='12' cy='12' r='8' stroke='currentColor' strokeWidth='2' />
      <path d='M12 7V12H17' stroke='currentColor' strokeWidth='2' />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM11 7V12V13H12H17V11H13V7H11Z'
        fill='currentColor'
      />
    </svg>
  );
}
