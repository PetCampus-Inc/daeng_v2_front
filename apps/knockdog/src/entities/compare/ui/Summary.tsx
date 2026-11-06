import { HighlightedText } from './HighlightedText';

export function Summary({
  children,
  highlight,
  truncate = false,
  className = '',
}: {
  children: string;
  highlight?: string;
  truncate?: boolean;
  className?: string;
}) {
  return (
    <p className={`h2-extrabold mb-0.5 flex min-w-0 justify-center ${className}`}>
      <HighlightedText text={children} highlight={highlight} truncate={truncate} highlightClassName='text-orange-500' />
    </p>
  );
}
