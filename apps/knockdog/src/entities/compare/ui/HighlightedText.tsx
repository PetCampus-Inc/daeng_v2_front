const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface HighlightedTextProps {
  text: string;
  highlight?: string;
  truncate?: boolean;
  highlightClassName?: string;
}

export function HighlightedText({
  text,
  highlight,
  truncate = false, // highlight된 텍스트에만 적용
  highlightClassName = 'text-orange-500',
}: HighlightedTextProps) {
  if (!highlight) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${escapeRegex(highlight)})`, 'gi');
  const parts = text.split(regex);

  console.log('HighlightedText DEBUG:', { text, highlight, parts });

  return (
    <span>
      {parts
        .filter((part) => part.length > 0)
        .map((part, index) => {
          const isHighlight = part.toLowerCase() === highlight.toLowerCase();
          return (
            <span
              key={index}
              className={`align-middle ${isHighlight ? highlightClassName : 'shrink-0'} ${truncate && isHighlight ? 'inline-block truncate' : ''}`}
            >
              {part}
            </span>
          );
        })}
    </span>
  );
}
