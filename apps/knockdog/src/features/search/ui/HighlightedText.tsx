import { memo, useMemo } from 'react';

interface HighlightedTextProps {
  text: string;
  query: string;
}

export const HighlightedText = memo(function HighlightedText({ text, query }: HighlightedTextProps) {
  const regex = useMemo(() => {
    if (!query.trim()) return null;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(${escapedQuery})`, 'gi');
  }, [query]);

  const highlightedText = useMemo(() => {
    if (!regex) return <>{text}</>;

    const parts = text.split(regex);
    return parts.map((part, index) => {
      const isMatch = regex.test(part);
      regex.lastIndex = 0;

      return isMatch ? (
        <mark key={index} className='text-text-accent bg-transparent'>
          {part}
        </mark>
      ) : (
        part
      );
    });
  }, [text, regex]);

  return <>{highlightedText}</>;
});
