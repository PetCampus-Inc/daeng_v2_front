export const TextHighlights = (text: string, searchTerm: string) => {
  const trimmedSearchTerm = searchTerm.trim();

  if (!trimmedSearchTerm) return text;

  const escapedSearchTerm = trimmedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === trimmedSearchTerm.toLowerCase()) {
      return (
        <span key={index} className='text-text-accent'>
          {part}
        </span>
      );
    }
    return part;
  });
};
