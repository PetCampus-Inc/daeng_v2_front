export function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <rect x='3.75' y='5' width='16.5' height='15.25' stroke='currentColor' strokeWidth='2' />
      <path d='M3.75 9.5H20.25' stroke='currentColor' strokeWidth='2' />
      <path d='M8 3V7' stroke='currentColor' strokeWidth='2' />
      <path d='M16 3V7' stroke='currentColor' strokeWidth='2' />
    </svg>
  );
}
