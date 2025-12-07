import { HighlightedText } from './HighlightedText';

export function Description({
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
    <p className={`h3-regular flex min-w-0 justify-center not-last:mb-0.5 ${className}`}>
      <HighlightedText text={children} highlight={highlight} truncate={truncate} highlightClassName='h3-extrabold' />
    </p>
  );
}
