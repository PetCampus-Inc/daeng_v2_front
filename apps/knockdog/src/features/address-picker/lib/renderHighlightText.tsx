const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightSpanText = (text: string, keyword: string) => {
  if (!keyword) return text;
  const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');

  const parts = text.split(regex).map((part) => ({
    text: part,
    className: regex.test(part) ? 'text-text-accent' : '',
  }));

  return parts.map((part, index) => (
    <span key={index} className={part.className}>
      {part.text}
    </span>
  ));
};

export { highlightSpanText };
