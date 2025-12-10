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
    <p className={`h3-regular mb-0.5 flex min-w-0 justify-center ${className}`}>
      <HighlightedText text={children} highlight={highlight} truncate={truncate} highlightClassName='h3-extrabold' />
    </p>
  );
}
