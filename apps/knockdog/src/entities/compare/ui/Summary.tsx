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
    <p className={`h2-extrabold flex min-w-0 justify-center not-last:mb-0.5 ${className}`}>
      <HighlightedText text={children} highlight={highlight} truncate={truncate} highlightClassName='text-orange-500' />
    </p>
  );
}
