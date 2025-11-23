const highlightSpanText = (text: string, keyword: string) => {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');

  const parts = text.split(regex).map((part) => ({
    text: part,
    className: part.toLowerCase() === keyword.toLowerCase() ? 'text-text-accent' : '',
  }));

  return parts.map((part, index) => (
    <span key={index} className={part.className}>
      {part.text}
    </span>
  ));
};

export { highlightSpanText };
