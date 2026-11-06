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
    return <span className={truncate ? 'inline-block max-w-full truncate' : ''}>{text}</span>;
  }

  const regex = new RegExp(`(${escapeRegex(highlight)})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className='inline-flex max-w-full items-center whitespace-pre-wrap'>
      {parts
        .filter((part) => part.length > 0)
        .map((part, index) => {
          const isHighlight = part.toLowerCase() === highlight.toLowerCase();
          return (
            <span
              key={index}
              className={`${isHighlight ? highlightClassName : ''} ${truncate && isHighlight ? 'truncate' : 'shrink-0'}`}
            >
              {part}
            </span>
          );
        })}
    </span>
  );
}
