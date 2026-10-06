export function LocationSearching(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <circle cx='12' cy='12' r='9' stroke='currentColor' strokeWidth='2' />
      <rect x='11' y='17' width='2' height='4' fill='currentColor' />
      <rect x='11' y='3' width='2' height='4' fill='currentColor' />
      <rect x='7' y='11' width='2' height='4' transform='rotate(90 7 11)' fill='currentColor' />
      <rect x='21' y='11' width='2' height='4' transform='rotate(90 21 11)' fill='currentColor' />
      <circle cx='12' cy='12' r='2' fill='currentColor' />
    </svg>
  );
}
