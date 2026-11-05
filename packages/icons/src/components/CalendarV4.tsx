/** V4 / Icon / Calendar. 노드 이름은 Calendar이고 그림은 연필이다. */
export function CalendarV4({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 18 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className ?? 'text-fill-secondary-500'}
      {...props}
    >
      <path
        d='M9.63672 14.6133H14.7368'
        stroke='currentColor'
        strokeWidth='1.11565'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14.8487 5.56796C15.1857 5.23099 15.3751 4.77392 15.3752 4.2973C15.3752 3.82069 15.186 3.36357 14.849 3.02651C14.512 2.68945 14.0549 2.50006 13.5783 2.5C13.1017 2.49994 12.6446 2.68922 12.3075 3.02619L3.79926 11.5364C3.65124 11.684 3.54178 11.8657 3.4805 12.0655L2.63835 14.84C2.62187 14.8951 2.62063 14.9537 2.63474 15.0095C2.64886 15.0652 2.67782 15.1162 2.71854 15.1568C2.75926 15.1975 2.81023 15.2264 2.86604 15.2404C2.92185 15.2544 2.98041 15.2531 3.03552 15.2365L5.81062 14.395C6.01027 14.3343 6.19196 14.2255 6.33976 14.0781L14.8487 5.56796Z'
        stroke='currentColor'
        strokeWidth='1.11565'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
