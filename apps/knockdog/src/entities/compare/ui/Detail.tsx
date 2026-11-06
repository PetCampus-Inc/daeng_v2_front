import { HighlightedText } from './HighlightedText';

export function Detail({
  children,
  highlight,
  className = '',
}: {
  children: string;
  highlight?: string;
  className?: string;
}) {
  return (
    <p className={`body1-medium text-text-secondary text-center ${className}`}>
      <HighlightedText text={children} highlight={highlight} highlightClassName='text-text-primary' />
    </p>
  );
}
